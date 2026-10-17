from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parents[2]
env = environ.Env(DJANGO_DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / ".env")
SECRET_KEY = env("DJANGO_SECRET_KEY", default="local-only-avrix-development-key-change-before-deploy-00000000000")
DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1", "testserver"])
INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.import_export",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "import_export",
    "enquiries",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]
WSGI_APPLICATION = "config.wsgi.application"
DATABASES = {"default": env.db(default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}")}
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation." + v}
    for v in ["UserAttributeSimilarityValidator", "MinimumLengthValidator", "CommonPasswordValidator", "NumericPasswordValidator"]
]
LANGUAGE_CODE = "en-gb"
TIME_ZONE = "Europe/London"
USE_I18N = True
USE_TZ = True
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=["http://localhost:5173"])
CORS_ALLOWED_ORIGIN_REGEXES = env.list("CORS_ALLOWED_ORIGIN_REGEXES", default=[])
CORS_ALLOW_CREDENTIALS = False
from corsheaders.defaults import default_headers  # noqa: E402

CORS_ALLOW_HEADERS = [*default_headers, "x-env"]
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=["https://api.avrixdigital.co.uk"])
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_THROTTLE_CLASSES": ["enquiries.throttles.PrivateScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"enquiries": "5/hour", "newsletter": "10/hour"},
}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.db.DatabaseCache", "LOCATION": "avrix_rate_cache"}}
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = env("EMAIL_HOST", default="localhost")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="AVRIX Digital <info@avrixdigital.co.uk>")
ENQUIRY_NOTIFY_TO = env.list("ENQUIRY_NOTIFY_TO", default=["info@avrixdigital.co.uk"])
TURNSTILE_SECRET_KEY = env("TURNSTILE_SECRET_KEY", default="")
IP_HASH_SALT = env("IP_HASH_SALT", default=SECRET_KEY)
ENQUIRY_RETENTION_MONTHS = env.int("ENQUIRY_RETENTION_MONTHS", default=24)
ADMIN_URL = env("ADMIN_URL", default="manage-7f3k/").strip("/") + "/"
SUPERADMIN_BOOTSTRAP_TOKEN = env("SUPERADMIN_BOOTSTRAP_TOKEN", default="")
SITE_URL = env("SITE_URL", default="https://avrixdigital.co.uk").rstrip("/")
API_URL = env("API_URL", default="https://api.avrixdigital.co.uk").rstrip("/")
BOOKING_URL = env("BOOKING_URL", default="") or SITE_URL + "/contact-us/"
TURNSTILE_HOSTNAMES = env.list("TURNSTILE_HOSTNAMES", default=["avrixdigital.co.uk", "www.avrixdigital.co.uk"])
EMAIL_ASYNC = True
DATA_UPLOAD_MAX_MEMORY_SIZE = 65536
UNFOLD = {
    "SITE_TITLE": "AVRIX Admin",
    "SITE_HEADER": "AVRIX Digital",
    "SITE_SYMBOL": "insights",
    "DASHBOARD_CALLBACK": "enquiries.dashboard.dashboard_callback",
    "COLORS": {
        "primary": {
            "50": "255 244 239",
            "100": "255 228 214",
            "200": "255 197 173",
            "300": "255 158 122",
            "400": "255 118 76",
            "500": "253 63 0",
            "600": "212 47 0",
            "700": "169 37 0",
            "800": "127 32 0",
            "900": "80 19 0",
            "950": "38 11 0",
        }
    },
}
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
