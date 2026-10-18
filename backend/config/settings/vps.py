"""Production settings for the shared VPS deployment."""

from .prod import *  # noqa: F403

# Only this hostname is being deployed; other subdomains have their own owners.
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
EMAIL_TIMEOUT = 15
SESSION_COOKIE_NAME = "avrix_sessionid"
CSRF_COOKIE_NAME = "avrix_csrftoken"
