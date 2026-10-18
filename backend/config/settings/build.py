"""Asset collection only; runtime deployments must use production settings."""
from .base import *  # noqa: F403

DEBUG = False
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
