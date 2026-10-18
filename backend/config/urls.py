from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from enquiries.admin_setup import register_superadmin

urlpatterns = [path("admin-setup/", register_superadmin, name="register-superadmin"), path(settings.ADMIN_URL, admin.site.urls), path("api/", include("enquiries.urls"))]
