from django.core.exceptions import ImproperlyConfigured
from .base import *  # noqa: F403
from .base import env, SECRET_KEY, IP_HASH_SALT, TURNSTILE_SECRET_KEY, PUBLIC_FORMS_ENABLED

DEBUG = False
if len(SECRET_KEY) < 50 or SECRET_KEY.startswith("local-only") or SECRET_KEY == "change-me":
    raise ImproperlyConfigured("Set a strong DJANGO_SECRET_KEY (at least 50 characters).")
if not IP_HASH_SALT or IP_HASH_SALT == "change-me":
    raise ImproperlyConfigured("Set a separate IP_HASH_SALT.")
if PUBLIC_FORMS_ENABLED and (not TURNSTILE_SECRET_KEY or TURNSTILE_SECRET_KEY.startswith("1x000")):
    raise ImproperlyConfigured("A production Turnstile secret is required.")
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 63072000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_AGE = 28800
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
if env("SENTRY_DSN", default=""):
    import sentry_sdk

    sentry_sdk.init(dsn=env("SENTRY_DSN"), send_default_pii=False)
