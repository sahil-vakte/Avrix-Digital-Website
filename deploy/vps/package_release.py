"""Package tracked app sources and the tested frontend build, excluding secrets."""

import argparse
import json
from pathlib import Path
import re
import subprocess
import tarfile
import io
import os


def package(sha, output):
    if not re.fullmatch(r"[0-9a-f]{40}", sha):
        raise ValueError("Expected a full Git commit SHA")
    files = subprocess.check_output(["git", "ls-files", "-z", "backend", "deploy/vps"]).decode().strip("\0").split("\0")
    files += [p.as_posix() for p in Path("frontend/dist").rglob("*") if p.is_file() and ".vite" not in p.parts]
    if not Path("frontend/dist/index.html").is_file():
        raise ValueError("Build the frontend before packaging")
    with tarfile.open(output, "w:gz") as archive:
        for name in sorted(set(files)):
            path = Path(name)
            if not path.is_file() or path.is_symlink():
                raise ValueError("Only regular release files are allowed")
            if path.name.startswith(".env") and path.name != ".env.example":
                raise ValueError("Environment files must never be packaged")
            archive.add(path, arcname=name, recursive=False)
        data = json.dumps({"sha": sha, "forms_enabled": os.environ.get("PUBLIC_FORMS_ENABLED", "false").lower() == "true"}).encode()
        info = tarfile.TarInfo("release.json")
        info.size = len(data)
        archive.addfile(info, io.BytesIO(data))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("sha")
    parser.add_argument("output")
    args = parser.parse_args()
    package(args.sha, args.output)
