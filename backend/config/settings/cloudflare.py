"""Django behind the trusted, same-origin Cloudflare Worker proxy."""
from urllib.parse import urlsplit
from django.core.exceptions import ImproperlyConfigured
from .prod import *  # noqa: F403
from .base import env, DATABASES

origin = env("PUBLIC_ORIGIN").rstrip("/")
parsed = urlsplit(origin)
if parsed.scheme != "https" or not parsed.hostname or parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.port:
    raise ImproperlyConfigured("PUBLIC_ORIGIN must be an HTTPS origin without a path or port.")
if DATABASES["default"]["ENGINE"] != "django.db.backends.postgresql":
    raise ImproperlyConfigured("Cloudflare Containers require a persistent PostgreSQL DATABASE_URL.")

ALLOWED_HOSTS = [parsed.hostname]
USE_X_FORWARDED_HOST = True
CSRF_TRUSTED_ORIGINS = [origin]
CORS_ALLOWED_ORIGINS = []
CORS_ALLOWED_ORIGIN_REGEXES = []
SITE_URL = origin
API_URL = origin
BOOKING_URL = env("BOOKING_URL", default="") or origin + "/contact-us/"
TURNSTILE_HOSTNAMES = [parsed.hostname]
EMAIL_TIMEOUT = 15
# Do not apply preload/includeSubDomains policies to a temporary workers.dev address.
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
# These policies deliberately remain disabled for the shared workers.dev domain.
SILENCED_SYSTEM_CHECKS = ["security.W005", "security.W021"]
