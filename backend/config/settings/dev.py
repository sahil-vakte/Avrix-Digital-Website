from .base import *  # noqa: F403

DEBUG = True

# Vite binds to 127.0.0.1, while developers may open either loopback hostname.
# Keep this local allowance in development even when an older .env lists only localhost.
CORS_ALLOWED_ORIGINS = list(dict.fromkeys([
    *CORS_ALLOWED_ORIGINS,  # noqa: F405
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]))
