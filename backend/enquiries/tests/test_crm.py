import json
import time
from unittest.mock import patch

import pytest
from django.core.management import call_command

from enquiries import crm
from enquiries.models import Enquiry, EnquiryActivity

pytestmark = pytest.mark.django_db


@pytest.fixture
def crm_on(settings):
    settings.AVRIX_CRM_URL = "https://crm.example.com"
    settings.AVRIX_CRM_KEY = "avx_test"
    settings.AVRIX_CRM_SECRET = "whsec_out"
    settings.AVRIX_CRM_WEBHOOK_SECRET = "whsec_in"
    return settings


def make(**kw):
    data = dict(full_name="Jane Smith", email="jane@example.co.uk", company="Example Ltd", services=["ga4-consulting"], budget="1k-3k",
                message="Help with GA4", ip_hash="x", utm_source="google", gclid="abc")
    data.update(kw)
    return Enquiry.objects.create(**data)


class FakeResponse:
    def __init__(self, status=201, body=None):
        self.status_code = status
        self._body = body or {"leadId": "lead-1", "outcome": "created"}
        self.text = json.dumps(self._body)

    def json(self):
        return self._body


def test_disabled_without_settings(settings):
    settings.AVRIX_CRM_URL = ""
    e = make()
    assert crm.sync_enquiry(e.pk) is False
    call_command("sync_to_crm")


def test_new_enquiry_is_posted_signed(crm_on):
    e = make()
    with patch("enquiries.crm.requests.post", return_value=FakeResponse()) as post:
        assert crm.sync_enquiry(e.pk) is True
    url, = post.call_args.args
    kwargs = post.call_args.kwargs
    assert url == "https://crm.example.com/api/intake/leads"
    h = kwargs["headers"]
    assert h["Authorization"] == "Bearer avx_test" and h["Idempotency-Key"] == f"enquiry-{e.pk}"
    body = kwargs["data"].decode()
    assert h["X-Avrix-Signature"] == "sha256=" + crm.sign("whsec_out", h["X-Avrix-Timestamp"], body)
    payload = json.loads(body)
    assert payload["externalId"] == str(e.pk) and payload["stage"] == "New" and payload["attribution"]["gclid"] == "abc"
    e.refresh_from_db()
    assert e.crm_synced_at and e.crm_lead_id == "lead-1" and e.crm_status == "new"


def test_status_change_is_pushed_once(crm_on):
    e = make()
    with patch("enquiries.crm.requests.post", return_value=FakeResponse()):
        crm.sync_enquiry(e.pk)
    Enquiry.objects.filter(pk=e.pk).update(status="qualified")
    assert list(crm.pending()) == [Enquiry.objects.get(pk=e.pk)]
    with patch("enquiries.crm.requests.post", return_value=FakeResponse(200, {"leadId": "lead-1"})) as post:
        call_command("sync_to_crm")
    assert post.call_args.args[0].endswith("/api/intake/status")
    assert json.loads(post.call_args.kwargs["data"])["stage"] == "Qualified"
    assert not crm.pending().exists()


def test_failure_is_recorded_and_retried(crm_on):
    e = make()
    with patch("enquiries.crm.requests.post", return_value=FakeResponse(500, {"error": "down"})):
        assert crm.sync_enquiry(e.pk) is False
    e.refresh_from_db()
    assert "500" in e.crm_error and e.crm_synced_at is None
    assert crm.pending().filter(pk=e.pk).exists()


def test_test_enquiries_are_not_sent(crm_on):
    e = make(is_test=True)
    with patch("enquiries.crm.requests.post") as post:
        assert crm.sync_enquiry(e.pk) is False
    post.assert_not_called()


def test_webhook_updates_status(api, crm_on):
    from django.utils import timezone
    e = make(crm_status="new", crm_synced_at=timezone.now())
    body = json.dumps({"event": "lead.stage_changed", "externalId": str(e.pk), "stage": "Proposal sent", "actor": "AB"})
    ts = str(int(time.time()))
    res = api.generic("POST", "/api/crm-webhook/", body, content_type="application/json",
                      HTTP_X_AVRIX_TIMESTAMP=ts, HTTP_X_AVRIX_SIGNATURE="sha256=" + crm.sign("whsec_in", ts, body))
    assert res.status_code == 200
    e.refresh_from_db()
    assert e.status == "proposal-sent" and e.crm_status == "proposal-sent"
    assert EnquiryActivity.objects.filter(enquiry=e, kind="status_change").exists()
    assert not crm.pending().filter(pk=e.pk).exists()  # not echoed back


def test_webhook_rejects_bad_signature_and_old_timestamp(api, crm_on):
    body = json.dumps({"event": "lead.stage_changed", "externalId": "x", "stage": "Won"})
    res = api.generic("POST", "/api/crm-webhook/", body, content_type="application/json", HTTP_X_AVRIX_TIMESTAMP=str(int(time.time())), HTTP_X_AVRIX_SIGNATURE="sha256=00")
    assert res.status_code == 401
    old = str(int(time.time()) - 3600)
    res = api.generic("POST", "/api/crm-webhook/", body, content_type="application/json", HTTP_X_AVRIX_TIMESTAMP=old, HTTP_X_AVRIX_SIGNATURE="sha256=" + crm.sign("whsec_in", old, body))
    assert res.status_code == 401
    res = api.generic("POST", "/api/crm-webhook/", "nope", content_type="application/json", HTTP_X_AVRIX_TIMESTAMP=str(int(time.time())),
                      HTTP_X_AVRIX_SIGNATURE="sha256=" + crm.sign("whsec_in", str(int(time.time())), "nope"))
    assert res.status_code == 400


def test_unknown_stage_or_enquiry_is_ignored(crm_on):
    assert crm.apply_stage_event({"event": "lead.stage_changed", "externalId": "00000000-0000-0000-0000-000000000000", "stage": "Won"}) is False
    assert crm.apply_stage_event({"event": "lead.stage_changed", "externalId": "x", "stage": "Something else"}) is False


def test_enquiry_endpoint_triggers_sync(api, payload, crm_on, settings, django_capture_on_commit_callbacks):
    settings.PUBLIC_FORMS_ENABLED = True
    with patch("enquiries.crm.requests.post", return_value=FakeResponse()) as post, django_capture_on_commit_callbacks(execute=True):
        res = api.post("/api/enquiries/", payload, format="json")
    assert res.status_code == 201
    assert any(c.args[0].endswith("/api/intake/leads") for c in post.call_args_list)


def test_mail_timer_also_syncs(crm_on):
    e = make()
    with patch("enquiries.crm.requests.post", return_value=FakeResponse()) as post:
        call_command("send_pending_emails")
    assert post.call_args.args[0].endswith("/api/intake/leads")
    e.refresh_from_db()
    assert e.crm_synced_at is not None


def make_subscriber(**kw):
    from django.utils import timezone
    from enquiries.models import Subscriber

    data = dict(name="Alex Reader", email="alex@example.co.uk", consent_text="By subscribing you agree to receive our monthly email.",
                source_page="/", confirmed_at=timezone.now())
    data.update(kw)
    return Subscriber.objects.create(**data)


def test_unconfirmed_subscriber_is_not_sent(crm_on):
    s = make_subscriber(confirmed_at=None)
    with patch("enquiries.crm.requests.post") as post:
        assert crm.sync_subscriber(s.pk) is True
    post.assert_not_called()
    assert not crm.pending_subscribers().exists()


def test_confirmed_subscriber_sent_once_with_consent(crm_on):
    s = make_subscriber()
    assert list(crm.pending_subscribers()) == [s]
    with patch("enquiries.crm.requests.post", return_value=FakeResponse()) as post:
        call_command("sync_to_crm")
        call_command("sync_to_crm")
    assert post.call_count == 1
    url, = post.call_args.args
    payload = json.loads(post.call_args.kwargs["data"].decode())
    assert url.endswith("/api/intake/leads")
    assert payload["source"] == "newsletter" and payload["stage"] == "Subscriber" and "Newsletter subscriber" in payload["tags"]
    assert payload["name"] == "Alex Reader" and payload["consent"]["marketing"] is True
    s.refresh_from_db()
    assert s.crm_synced_at and s.crm_lead_id == "lead-1"


def test_unsubscribe_is_mirrored(crm_on):
    from django.utils import timezone

    s = make_subscriber(crm_synced_at=timezone.now(), unsubscribed_at=timezone.now())
    with patch("enquiries.crm.requests.post", return_value=FakeResponse(200, {"leadId": "lead-1"})) as post:
        assert crm.sync_subscriber(s.pk) is True
    url, = post.call_args.args
    payload = json.loads(post.call_args.kwargs["data"].decode())
    assert url.endswith("/api/intake/status") and payload["stage"] == "Unsubscribed" and payload["externalId"] == f"subscriber-{s.pk}"
    s.refresh_from_db()
    assert s.crm_unsubscribe_synced_at and not crm.pending_subscribers().exists()


def test_subscriber_crm_failure_is_recorded(crm_on):
    s = make_subscriber()
    with patch("enquiries.crm.requests.post", return_value=FakeResponse(500, {"error": "down"})):
        assert crm.sync_subscriber(s.pk) is False
    s.refresh_from_db()
    assert "500" in s.crm_error and crm.pending_subscribers().exists()


def test_newsletter_name_required(api):
    from enquiries.tests.test_api import newsletter_payload

    data = newsletter_payload()
    data["name"] = ""
    assert api.post("/api/newsletter/", data, format="json").status_code == 400
    data["name"] = "http://spam.example"
    assert api.post("/api/newsletter/", data, format="json").status_code == 400
