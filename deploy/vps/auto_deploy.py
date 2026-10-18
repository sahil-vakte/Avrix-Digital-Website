#!/usr/bin/python3
"""Root-owned deployment entry point. Accepts one bounded release on stdin.

Application code, pip and Django commands run as the isolated avrix user. This
script never installs services, reloads Nginx or executes release scripts as root.
"""

from datetime import datetime, timezone
import fcntl
import grp
import hashlib
import http.client
import io
import json
import os
from pathlib import Path, PurePosixPath
import pwd
import re
import shutil
import socket
import ssl
import subprocess
import sys
import tarfile
import time
import uuid
import urllib.request

ROOT = Path("/opt/avrix-website")
SHA_PATTERN = r"[0-9a-f]{40}"
MAX_COMPRESSED = 40 * 1024 * 1024
MAX_EXPANDED = 200 * 1024 * 1024


def validate_members(archive, sha):
    members = []
    expanded = 0
    names = set()
    for member in archive:
        expanded += member.size
        if len(members) >= 10000 or expanded > MAX_EXPANDED:
            raise ValueError("Release exceeds size limits")
        members.append(member)
        path = PurePosixPath(member.name)
        allowed = member.name == "release.json" or any(
            member.name.startswith(prefix) for prefix in ("backend/", "frontend/dist/", "deploy/vps/")
        )
        if not allowed or path.is_absolute() or ".." in path.parts or "\\" in member.name:
            raise ValueError("Unexpected release path")
        if path.as_posix() != member.name:
            raise ValueError("Release paths must be canonical")
        if not member.isfile() or member.name in names:
            raise ValueError("Release must contain unique regular files")
        if (path.name.startswith(".env") and path.name != ".env.example") or path.suffix in (".sqlite3", ".key", ".pem"):
            raise ValueError("Secret or development database in release")
        names.add(member.name)
    required = {"release.json", "backend/manage.py", "backend/requirements.lock.txt", "frontend/dist/index.html"}
    if not required.issubset(names):
        raise ValueError("Incomplete release")
    with archive.extractfile("release.json") as metadata:
        config = json.load(metadata)
        if config.get("sha") != sha or not isinstance(config.get("forms_enabled"), bool):
            raise ValueError("Release commit does not match requested deployment")
    return members


def run(args):
    subprocess.run(args, check=True)


def wims_identity():
    return (
        subprocess.check_output(["supervisorctl", "pid", "inventory"], text=True).strip(),
        hashlib.sha256(Path("/etc/nginx/sites-available/wims.cloud").read_bytes()).hexdigest(),
    )


def check_wims(identity):
    if wims_identity() != identity:
        raise RuntimeError("Existing application identity or configuration changed")
    with urllib.request.urlopen("https://wims.cloud/", timeout=15) as response:
        if response.status != 200:
            raise RuntimeError("Existing application health check failed")


def build_command(release, command):
    # All executable app/dependency code stays inside the Avrix resource slice,
    # has no root privileges, and cannot write to WIMS or existing release files.
    run([
        "systemd-run", "--quiet", "--wait", "--pipe", "--collect",
        "--unit=avrix-build-" + uuid.uuid4().hex,
        "--slice=avrix.slice", "--uid=avrix", "--gid=avrix",
        "--property=EnvironmentFile=" + str(ROOT / "shared/backend.env"),
        "--property=WorkingDirectory=" + str(release / "backend"),
        "--property=Nice=19", "--property=PrivateTmp=true",
        "--property=ProtectHome=true", "--property=ProtectSystem=strict",
        "--property=NoNewPrivileges=true", "--property=ReadWritePaths=" + str(release),
        "--", *map(str, command),
    ])


def activate(release):
    temporary = ROOT / ("current-" + uuid.uuid4().hex)
    temporary.symlink_to(release, target_is_directory=True)
    os.replace(temporary, ROOT / "current")
    run(["systemctl", "restart", "avrix-api.service"])


def healthy(sha):
    request = urllib.request.Request("http://127.0.0.1:8011/api/health/", headers={
        "Host": "avrixdigital.co.uk", "X-Forwarded-Proto": "https",
    })
    for attempt in range(20):
        try:
            with urllib.request.urlopen(request, timeout=3) as response:
                if response.status == 200:
                    break
        except (OSError, urllib.error.URLError):
            if attempt == 19:
                raise RuntimeError("New backend did not become healthy") from None
            time.sleep(1)
    # Verify the actual Nginx frontend with hostname/certificate validation,
    # bypassing external DNS caches on this same server.
    connection = http.client.HTTPSConnection("avrixdigital.co.uk", timeout=10)
    connection.sock = ssl.create_default_context().wrap_socket(
        socket.create_connection(("127.0.0.1", 443), timeout=10), server_hostname="avrixdigital.co.uk",
    )
    try:
        connection.request("GET", "/release.txt")
        response = connection.getresponse()
        if response.status != 200 or response.read().decode().strip() != sha:
            raise RuntimeError("New frontend release check failed")
    finally:
        connection.close()


def deploy(sha, stream):
    if not re.fullmatch(SHA_PATTERN, sha):
        raise ValueError("Expected a full Git commit SHA")
    incoming = stream.read(MAX_COMPRESSED + 1)
    if len(incoming) > MAX_COMPRESSED:
        raise ValueError("Compressed release exceeds size limit")
    # Validate the entire archive before writing any release paths.
    with tarfile.open(fileobj=io.BytesIO(incoming), mode="r:gz") as archive:
        members = validate_members(archive, sha)
        metadata = json.load(archive.extractfile("release.json"))
        config = dict(line.split("=", 1) for line in (ROOT / "shared/backend.env").read_text().splitlines() if line and not line.startswith("#"))
        forms_enabled = config.get("PUBLIC_FORMS_ENABLED", "True").strip("\"'").lower() in ("true", "1", "yes", "on")
        if metadata["forms_enabled"] != forms_enabled:
            raise ValueError("Frontend form configuration differs from the server environment")
        identity = wims_identity()
        check_wims(identity)
        previous = (ROOT / "current").resolve(strict=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        release = ROOT / "releases" / (sha + "-" + stamp + "-" + uuid.uuid4().hex[:8])
        release.mkdir(mode=0o755)
        for member in members:
            destination = release / member.name
            destination.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            with archive.extractfile(member) as source, destination.open("wb") as target:
                shutil.copyfileobj(source, target)
            destination.chmod(0o644)
    (release / "frontend/dist/release.txt").write_text(sha + "\n")
    owner = pwd.getpwnam("avrix").pw_uid
    group = grp.getgrnam("avrix").gr_gid
    for directory, directories, files in os.walk(release):
        os.chown(directory, owner, group)
        for name in files:
            os.chown(Path(directory) / name, owner, group)
    try:
        build_command(release, ["/usr/bin/python3.12", "-m", "venv", release / ".venv"])
        python = release / ".venv/bin/python"
        build_command(release, [python, "-m", "pip", "install", "--no-cache-dir", "-r", "requirements.lock.txt"])
        build_command(release, [python, "manage.py", "check", "--deploy", "--fail-level", "ERROR"])
        # Back up only Avrix before applying migrations. Do not reverse database
        # migrations on application rollback; PRs must retain schema compatibility.
        run(["systemctl", "start", "avrix-backup.service"])
        for command in (["migrate", "--noinput"], ["createcachetable"], ["collectstatic", "--noinput"]):
            build_command(release, [python, "manage.py", *command])
        # Freeze the prepared release. The running application cannot rewrite it.
        for directory, directories, files in os.walk(release, followlinks=False):
            os.chown(directory, 0, 0)
            for name in directories + files:
                os.chown(Path(directory) / name, 0, 0, follow_symlinks=False)
        check_wims(identity)
        activate(release)
        healthy(sha)
        check_wims(identity)
    except Exception:
        if (ROOT / "current").resolve() != previous:
            activate(previous)
            print("Application rolled back to the previous release. Database migrations were not reversed.", flush=True)
        raise
    previous_link = ROOT / "previous"
    if previous_link.is_symlink():
        previous_link.unlink()
    previous_link.symlink_to(previous, target_is_directory=True)
    print("Avrix deployment verified: " + sha, flush=True)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Expected one commit SHA")
    os.umask(0o022)
    with (ROOT / "shared/deployment.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        deploy(sys.argv[1], sys.stdin.buffer)
