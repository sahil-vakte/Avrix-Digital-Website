import hashlib
from django.conf import settings
from rest_framework.throttling import ScopedRateThrottle


def client_ip(request):
    # Caddy overwrites this header; the API port is never public.
    return request.META.get("HTTP_X_REAL_IP", request.META.get("REMOTE_ADDR", ""))


def private_ip(request):
    return hashlib.sha256((client_ip(request) + settings.IP_HASH_SALT).encode()).hexdigest()


class PrivateScopedRateThrottle(ScopedRateThrottle):
    def get_ident(self, request):
        return private_ip(request)
