from datetime import timedelta
from unittest.mock import patch, Mock
import pytest
from django.contrib import admin
from django.contrib.auth.models import User, Group
from django.contrib.messages.storage.fallback import FallbackStorage
from django.core.management import call_command
from django.test import RequestFactory
from django.utils import timezone
from enquiries.models import Enquiry, EmailJob, EnquiryActivity, Subscriber
from enquiries.admin import EnquiryAdmin, EnquiryResource, ServiceFilter, VisibilityFilter, SubscriberAdmin, ActivityInline
from enquiries.dashboard import dashboard_callback
from enquiries.emails import send_job, dispatch, _worker
from enquiries.permissions import create_groups

pytestmark = pytest.mark.django_db


def enquiry(**kwargs):
    defaults = dict(
        full_name="Jane",
        email="jane@example.co.uk",
        services=["ga4-consulting"],
        budget="not-sure",
        message="A valid message about analytics.",
        privacy_ack=True,
    )
    defaults.update(kwargs)
    return Enquiry.objects.create(**defaults)


def request_for(user):
    request = RequestFactory().get("/")
    request.user = user
    request.session = {}
    request._messages = FallbackStorage(request)
    return request


def test_email_retry_and_idempotency(settings):
    e = enquiry()
    job = EmailJob.objects.create(enquiry=e, kind="team")
    with patch("enquiries.emails.EmailMultiAlternatives.send", side_effect=OSError):
        send_job(job.pk)
    e.refresh_from_db()
    job.refresh_from_db()
    assert e.email_failed and job.sent_at is None and job.last_error == "OSError"
    call_command("send_pending_emails")
    job.refresh_from_db()
    assert job.sent_at and job.attempts == 2
    send_job(job.pk)
    job.refresh_from_db()
    assert job.attempts == 2
    with patch("enquiries.emails.pool.submit") as submit:
        settings.EMAIL_ASYNC = True
        dispatch([job.pk])
        submit.assert_called_once()
    with patch("enquiries.emails.close_old_connections"), patch("enquiries.emails.send_job") as send:
        _worker([job.pk])
        send.assert_called_once_with(job.pk)


def test_retention():
    old = enquiry()
    won = enquiry(status="won")
    Enquiry.objects.filter(pk__in=[old.pk, won.pk]).update(created_at=timezone.now() - timedelta(days=800))
    call_command("purge_old_enquiries", dry_run=True)
    assert Enquiry.objects.count() == 2
    call_command("purge_old_enquiries")
    assert list(Enquiry.objects.values_list("pk", flat=True)) == [won.pk]


def test_admin_permissions_and_pages(client):
    create_groups()
    user = User.objects.create_superuser("admin", "admin@example.co.uk", "secret")
    sales = User.objects.create_user("sales", password="secret", is_staff=True)
    sales.groups.add(Group.objects.get(name="Sales"))
    e = enquiry()
    client.force_login(user)
    for path in ["/manage-7f3k/", "/manage-7f3k/enquiries/enquiry/", f"/manage-7f3k/enquiries/enquiry/{e.pk}/change/", "/manage-7f3k/enquiries/subscriber/"]:
        response = client.get(path)
        assert response.status_code == 200, path
    client.force_login(sales)
    assert client.get(f"/manage-7f3k/enquiries/enquiry/{e.pk}/delete/").status_code == 403
    assert client.get("/manage-7f3k/auth/user/").status_code == 403
    assert client.get("/manage-7f3k/enquiries/enquiry/").status_code == 200


def test_admin_actions_timeline_filters_and_exports():
    user = User.objects.create_superuser("admin", "admin@example.co.uk", "secret")
    request = request_for(user)
    model_admin = EnquiryAdmin(Enquiry, admin.site)
    e = enquiry()
    qs = Enquiry.objects.filter(pk=e.pk)
    for action in ["mark_contacted", "mark_qualified", "mark_spam", "assign_to_me"]:
        getattr(model_admin, action)(request, qs)
    assert EnquiryActivity.objects.count() == 4
    e.refresh_from_db()
    e.status = "won"
    e.owner = None
    e.internal_notes = "Discussed pricing."
    model_admin.save_model(request, e, Mock(), True)
    assert EnquiryActivity.objects.count() == 7
    assert "mailto:" in model_admin.reply_link(e)
    assert "ga4-consulting" in model_admin.service_badges(e)
    assert "Won" in model_admin.status_badge(e)
    assert not model_admin.has_add_permission(request)
    for value in [None, "all", "test", "spam"]:
        params = {"visibility": [value]} if value else {}
        f = VisibilityFilter(request, params, Enquiry, model_admin)
        list(f.queryset(request, Enquiry.objects.all()))
        assert f.lookups(request, model_admin)
    f = ServiceFilter(request, {"service": ["ga4-consulting"]}, Enquiry, model_admin)
    assert f.queryset(request, Enquiry.objects.all()).count() == 1
    assert f.lookups(request, model_admin)
    f = ServiceFilter(request, {}, Enquiry, model_admin)
    assert f.queryset(request, Enquiry.objects.all()).count() == 1
    resource = EnquiryResource()
    e.full_name = "=CMD()"
    e.save()
    assert "'=CMD()" in resource.export(Enquiry.objects.all()).csv
    assert resource.export(Enquiry.objects.all()).xlsx.startswith(b"PK")
    subscriber = Subscriber.objects.create(email="test@example.co.uk", consent_text="Consent")
    sub_admin = SubscriberAdmin(Subscriber, admin.site)
    assert not sub_admin.has_add_permission(request)
    sub_admin.unsubscribe(request, Subscriber.objects.all())
    subscriber.refresh_from_db()
    assert subscriber.unsubscribed_at
    assert str(subscriber) == subscriber.email and str(e)
    assert not ActivityInline(EnquiryActivity, admin.site).has_add_permission(request)


def test_dashboard():
    user = User.objects.create_superuser("admin", "admin@example.co.uk", "secret")
    enquiry(next_action_at=timezone.now() - timedelta(hours=1), utm_source="google")
    context = dashboard_callback(request_for(user), {})
    assert context["metrics"][0][1] == 1 and len(context["followups"]) == 1
    user.is_superuser = False
    user.save()
    user = User.objects.get(pk=user.pk)
    assert dashboard_callback(request_for(user), {}) == {}


@pytest.mark.parametrize("debug", [True, False])
def test_enquiry_visibility_matches_environment(settings, debug):
    settings.DEBUG = debug
    user = User.objects.create_superuser("visibility-admin", "admin@example.co.uk", "secret")
    request = request_for(user)
    live = enquiry()
    test = enquiry(is_test=True)
    spam = enquiry(status="spam")
    model_admin = EnquiryAdmin(Enquiry, admin.site)
    default_filter = VisibilityFilter(request, {}, Enquiry, model_admin)
    expected = {live.pk, test.pk} if debug else {live.pk}
    assert set(default_filter.queryset(request, Enquiry.objects.all()).values_list("pk", flat=True)) == expected
    context = dashboard_callback(request, {})
    assert {e.pk for e in context["latest"]} == expected
    assert context["includes_test_enquiries"] is debug
    for selection, visible in [("live", {live.pk}), ("test", {test.pk}), ("spam", {spam.pk}), ("all", {live.pk, test.pk, spam.pk})]:
        selected = VisibilityFilter(request, {"visibility": [selection]}, Enquiry, model_admin)
        assert set(selected.queryset(request, Enquiry.objects.all()).values_list("pk", flat=True)) == visible


def test_admin_mark_spam_button(client):
    user = User.objects.create_superuser("operator", "operator@example.co.uk", "secret")
    e = enquiry()
    client.force_login(user)
    response = client.post(
        f"/manage-7f3k/enquiries/enquiry/{e.pk}/change/",
        {
            "status": "new",
            "priority": "normal",
            "owner": "",
            "internal_notes": "",
            "next_action_at_0": "",
            "next_action_at_1": "",
            "activities-TOTAL_FORMS": "0",
            "activities-INITIAL_FORMS": "0",
            "activities-MIN_NUM_FORMS": "0",
            "activities-MAX_NUM_FORMS": "1000",
            "_mark_spam": "1",
        },
    )
    assert response.status_code == 302
    e.refresh_from_db()
    assert e.status == "spam"
