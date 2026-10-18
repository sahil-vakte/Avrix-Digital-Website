"""Archive validation protects a privileged deployment boundary."""

import importlib.util
import io
import json
from pathlib import Path
import tarfile
import unittest
from unittest.mock import patch
import tempfile
from types import SimpleNamespace

spec = importlib.util.spec_from_file_location("auto_deploy", Path(__file__).with_name("auto_deploy.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
SHA = "a" * 40


def archive(extra=None, metadata=None):
    buffer = io.BytesIO()
    content = {"backend/manage.py": b"", "backend/requirements.lock.txt": b"", "frontend/dist/index.html": b"", "release.json": json.dumps(metadata or {"sha": SHA, "forms_enabled": False}).encode()}
    with tarfile.open(fileobj=buffer, mode="w:gz") as result:
        for name, data in content.items():
            item = tarfile.TarInfo(name)
            item.size = len(data)
            result.addfile(item, io.BytesIO(data))
        if extra is not None:
            result.addfile(extra, io.BytesIO(b"x" * extra.size) if extra.isfile() else None)
    buffer.seek(0)
    result = tarfile.open(fileobj=buffer, mode="r:gz")
    result.compressed_buffer = buffer
    return result


class ValidateRelease(unittest.TestCase):
    def test_accepts_complete_release(self):
        with archive() as value:
            self.assertEqual(len(module.validate_members(value, SHA)), 4)

    def test_rejects_unexpected_commit(self):
        with archive(metadata={"sha": "b" * 40, "forms_enabled": False}) as value:
            with self.assertRaises(ValueError):
                module.validate_members(value, SHA)

    def test_rejects_traversal_secrets_duplicates_and_noncanonical_paths(self):
        for name in ["backend/../../etc/passwd", "/etc/passwd", "backend/.env", "backend/db.sqlite3", "backend/id.key", "backend//manage.py", "backend/manage.py"]:
            with self.subTest(name=name), archive(tarfile.TarInfo(name)) as value:
                with self.assertRaises(ValueError):
                    module.validate_members(value, SHA)

    def test_rejects_links_and_devices(self):
        for kind in [tarfile.SYMTYPE, tarfile.LNKTYPE, tarfile.CHRTYPE]:
            item = tarfile.TarInfo("backend/link")
            item.type = kind
            item.linkname = "/etc/passwd"
            with self.subTest(kind=kind), archive(item) as value:
                with self.assertRaises(ValueError):
                    module.validate_members(value, SHA)

    def test_restores_previous_application_if_new_health_check_fails(self):
        with tempfile.TemporaryDirectory() as directory, archive() as value:
            root = Path(directory)
            (root / "shared").mkdir()
            (root / "shared/backend.env").write_text("PUBLIC_FORMS_ENABLED=False\n")
            previous = root / "releases/previous"
            previous.mkdir(parents=True)
            (root / "current").symlink_to(previous, target_is_directory=True)
            compressed = io.BytesIO(value.compressed_buffer.getvalue())
            with patch.object(module, "ROOT", root), patch.object(module, "wims_identity", return_value=("pid", "hash")), patch.object(module, "check_wims"), patch.object(module, "build_command"), patch.object(module, "run"), patch.object(module.os, "chown"), patch.object(module.pwd, "getpwnam", return_value=SimpleNamespace(pw_uid=1000)), patch.object(module.grp, "getgrnam", return_value=SimpleNamespace(gr_gid=1000)), patch.object(module, "healthy", side_effect=RuntimeError("unhealthy")):
                with self.assertRaisesRegex(RuntimeError, "unhealthy"):
                    module.deploy(SHA, compressed)
            self.assertEqual((root / "current").resolve(), previous)


if __name__ == "__main__":
    unittest.main()
