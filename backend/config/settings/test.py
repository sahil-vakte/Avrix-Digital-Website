from .base import *  # noqa: F403

DEBUG = True
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
EMAIL_ASYNC = False
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
