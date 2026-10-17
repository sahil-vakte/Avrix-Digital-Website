import hashlib
from django.conf import settings
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.http import Http404
from django.shortcuts import render
from django.urls import reverse
from django.utils.crypto import constant_time_compare, salted_hmac
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.http import require_http_methods
from .admin_forms import SuperadminRegistrationForm
from .models import AdminBootstrapUse


@sensitive_post_parameters("bootstrap_token", "password1", "password2")
@never_cache
@csrf_protect
@require_http_methods(["GET", "POST"])
def register_superadmin(request):
    token = settings.SUPERADMIN_BOOTSTRAP_TOKEN
    if len(token) < 32:
        raise Http404
    digest = hashlib.sha256(token.encode()).hexdigest()
    if AdminBootstrapUse.objects.filter(pk=digest).exists():
        raise Http404
    form = SuperadminRegistrationForm(request.POST or None)
    status = 200
    complete = False
    setup_error = ""
    if request.method == "POST":
        # Bound attempts without storing raw IP addresses or submitted credentials.
        identity = salted_hmac("admin-bootstrap-rate", request.META.get("REMOTE_ADDR", "unknown")).hexdigest()
        key = f"admin-bootstrap:{identity}"
        cache.add(key, 0, 600)
        try:
            attempts = cache.incr(key)
        except ValueError:
            cache.set(key, 1, 600)
            attempts = 1
        if attempts > 10:
            setup_error = "Too many attempts. Please try again in ten minutes."
            form = SuperadminRegistrationForm()
            status = 429
        elif not constant_time_compare(hashlib.sha256(request.POST.get("bootstrap_token", "").encode()).hexdigest(), digest):
            setup_error = "The bootstrap token is invalid."
            form = SuperadminRegistrationForm()
            status = 403
        elif form.is_valid():
            try:
                with transaction.atomic():
                    # The unique digest prevents concurrent requests or replay from creating another administrator.
                    AdminBootstrapUse.objects.create(token_hash=digest)
                    user = form.save(commit=False)
                    user.is_active = True
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                complete = True
            except IntegrityError:
                form.add_error(None, "Setup could not be completed. The token may already have been used.")
                status = 409
        else:
            status = 400
    response = render(request, "admin/register_superadmin.html", {
        "form": form, "complete": complete, "setup_error": setup_error, "login_url": reverse("admin:login"),
    }, status=status)
    response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
    response["Referrer-Policy"] = "no-referrer"
    return response
