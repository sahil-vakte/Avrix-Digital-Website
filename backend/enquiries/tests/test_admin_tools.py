import hashlib
import pytest
from django.contrib.auth.models import Group, Permission, User
from django.test import Client
from django.urls import reverse
from enquiries.models import AdminBootstrapUse, Enquiry, EnquiryActivity
from enquiries.permissions import create_groups

pytestmark = pytest.mark.django_db


@pytest.fixture
def registration(settings):
    settings.SUPERADMIN_BOOTSTRAP_TOKEN = "test-bootstrap-token-" + "x" * 48
    return {
        "username": "new-owner",
        "email": "owner@example.co.uk",
        "password1": "BlueOrbit!_47_RiverCloud_928",
        "password2": "BlueOrbit!_47_RiverCloud_928",
        "bootstrap_token": settings.SUPERADMIN_BOOTSTRAP_TOKEN,
    }


def test_registration_is_unavailable_without_a_strong_token(client, settings):
    for token in ["", "short"]:
        settings.SUPERADMIN_BOOTSTRAP_TOKEN = token
        assert client.get(reverse("register-superadmin")).status_code == 404


def test_superadmin_registration_is_one_use_and_does_not_echo_secrets(client, registration):
    url = reverse("register-superadmin")
    page = client.get(url)
    assert page.status_code == 200
    assert page["X-Robots-Tag"] == "noindex, nofollow, noarchive"
    assert "no-store" in page["Cache-Control"]
    response = client.post(url, registration)
    assert response.status_code == 200 and response.context["complete"]
    user = User.objects.get(username=registration["username"])
    assert user.is_active and user.is_staff and user.is_superuser
    assert user.check_password(registration["password1"])
    assert AdminBootstrapUse.objects.filter(pk=hashlib.sha256(registration["bootstrap_token"].encode()).hexdigest()).exists()
    assert registration["bootstrap_token"] not in response.content.decode()
    assert registration["password1"] not in response.content.decode()
    assert client.get(url).status_code == 404
    assert client.post(url, {**registration, "username": "second-owner"}).status_code == 404
    assert User.objects.count() == 1


def test_invalid_token_and_password_cannot_create_superadmin(client, registration):
    url = reverse("register-superadmin")
    assert client.post(url, {**registration, "bootstrap_token": "incorrect"}).status_code == 403
    assert client.post(url, {**registration, "password2": "does-not-match"}).status_code == 400
    assert not User.objects.exists() and not AdminBootstrapUse.objects.exists()


def test_registration_requires_csrf_and_limits_attempts(registration):
    url = reverse("register-superadmin")
    client = Client(enforce_csrf_checks=True)
    assert client.post(url, registration).status_code == 403
    client = Client()
    for _ in range(10):
        assert client.post(url, {**registration, "bootstrap_token": "incorrect"}).status_code == 403
    assert client.post(url, registration).status_code == 429
    assert not User.objects.exists()


@pytest.fixture
def enquiry():
    return Enquiry.objects.create(
        full_name="Example enquiry", email="enquiry@example.co.uk", phone="01234 567890", company="Example business",
        services=["wims"], budget="not-sure", preferred_contact="phone", message="Warehouse requirements. <script>alert(1)</script>", is_test=True,
    )


def test_enquiry_panel_shows_details_and_records_status_change(client, enquiry):
    user = User.objects.create_superuser("operator", "operator@example.co.uk", "test-password")
    client.force_login(user)
    url = reverse("admin:enquiries_enquiry_panel", args=[enquiry.pk])
    response = client.get(url)
    assert response.status_code == 200
    assert enquiry.phone in response.content.decode()
    assert "&lt;script&gt;" in response.content.decode() and "<script>alert" not in response.content.decode()
    response = client.post(url, {"status": "qualified"})
    assert response.status_code == 200
    enquiry.refresh_from_db()
    assert enquiry.status == "qualified"
    assert EnquiryActivity.objects.get(enquiry=enquiry).detail == "new -> qualified"
    assert "Status saved." in response.content.decode()
    assert client.post(url, {"status": "invalid-status"}).status_code == 400
    enquiry.refresh_from_db()
    assert enquiry.status == "qualified"


def test_enquiry_panel_requires_login_and_edit_permission(client, enquiry):
    url = reverse("admin:enquiries_enquiry_panel", args=[enquiry.pk])
    assert client.get(url).status_code == 302
    viewer = User.objects.create_user("viewer", is_staff=True)
    viewer.user_permissions.add(Permission.objects.get(codename="view_enquiry"))
    client.force_login(viewer)
    response = client.get(url)
    assert response.status_code == 200 and not response.context["can_change"]
    assert client.post(url, {"status": "won"}).status_code == 403
    enquiry.refresh_from_db()
    assert enquiry.status == "new"


def test_enquiry_status_post_requires_csrf(enquiry):
    user = User.objects.create_superuser("csrf-operator", "operator@example.co.uk", "test-password")
    client = Client(enforce_csrf_checks=True)
    client.force_login(user)
    url = reverse("admin:enquiries_enquiry_panel", args=[enquiry.pk])
    assert client.post(url, {"status": "won"}).status_code == 403
    client.get(url)
    assert client.post(url, {"status": "won", "csrfmiddlewaretoken": client.cookies["csrftoken"].value}).status_code == 200


@pytest.mark.parametrize("superuser", [False, True])
def test_administrators_can_delete_users(client, superuser):
    create_groups()
    actor = User.objects.create_user("administrator", is_staff=True, is_superuser=superuser)
    if not superuser:
        actor.groups.add(Group.objects.get(name="Admin"))
    target = User.objects.create_user("remove-this-user")
    client.force_login(actor)
    url = reverse("admin:auth_user_delete", args=[target.pk])
    assert client.get(url).status_code == 200
    assert client.post(url, {"post": "yes"}).status_code == 302
    assert not User.objects.filter(pk=target.pk).exists()


def test_sales_cannot_delete_users(client):
    create_groups()
    sales = User.objects.create_user("sales-person", is_staff=True)
    sales.groups.add(Group.objects.get(name="Sales"))
    target = User.objects.create_user("keep-this-user")
    client.force_login(sales)
    assert client.post(reverse("admin:auth_user_delete", args=[target.pk]), {"post": "yes"}).status_code == 403
    assert User.objects.filter(pk=target.pk).exists()
