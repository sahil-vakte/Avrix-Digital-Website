from datetime import timedelta
from unittest.mock import patch, Mock
import pytest
from django.core import mail
from django.utils import timezone
from enquiries.models import Enquiry, EmailJob, Subscriber

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize("endpoint", ["enquiries", "newsletter"])
def test_disabled_public_forms_reject_without_saving_or_email(api, settings, endpoint):
    settings.PUBLIC_FORMS_ENABLED = False
    response = api.post(f"/api/{endpoint}/", {}, format="json")
    assert response.status_code == 503
    assert Enquiry.objects.count() == 0
    assert Subscriber.objects.count() == 0
    assert EmailJob.objects.count() == 0


@pytest.mark.parametrize("solution", ["voice-call-agent", "wims", "hr-desk"])
def test_solution_enquiry(api, payload, solution):
    payload["services"] = [solution]
    response = api.post("/api/enquiries/", payload, format="json")
    assert response.status_code == 201
    assert Enquiry.objects.get().services == [solution]


@pytest.mark.parametrize("origin", ["http://localhost:5173", "http://127.0.0.1:5173"])
def test_local_frontend_cors_preflight(api, settings, origin):
    from config.settings import dev

    settings.CORS_ALLOWED_ORIGINS = dev.CORS_ALLOWED_ORIGINS
    response = api.options(
        "/api/enquiries/",
        HTTP_ORIGIN=origin,
        HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
        HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type,x-env",
    )
    assert response.status_code == 200
    assert response["Access-Control-Allow-Origin"] == origin
    assert "x-env" in response["Access-Control-Allow-Headers"]
    assert "POST" in response["Access-Control-Allow-Methods"]


def test_local_cors_still_rejects_unlisted_origins(api, settings):
    from config.settings import dev

    settings.CORS_ALLOWED_ORIGINS = dev.CORS_ALLOWED_ORIGINS
    settings.CORS_ALLOWED_ORIGIN_REGEXES = []
    response = api.options(
        "/api/enquiries/",
        HTTP_ORIGIN="https://unlisted.example",
        HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
    )
    assert "Access-Control-Allow-Origin" not in response


def test_enquiry_email_attribution(api, payload, django_capture_on_commit_callbacks):
    with django_capture_on_commit_callbacks(execute=True):
        response = api.post("/api/enquiries/", payload, format="json", HTTP_X_ENV="production", REMOTE_ADDR="192.0.2.1")
    assert response.status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.utm_source == "google" and enquiry.gclid == "abc"
    assert len(enquiry.ip_hash) == 64 and "192.0.2.1" not in enquiry.ip_hash
    assert enquiry.status == "new" and not enquiry.is_test
    assert len(mail.outbox) == 2
    assert mail.outbox[0].reply_to == [payload["email"]]
    assert EmailJob.objects.filter(sent_at__isnull=False).count() == 2
    assert enquiry.activities.filter(kind="email_sent").count() == 2


@pytest.mark.parametrize(
    "change",
    [
        {"privacy_ack": False},
        {"full_name": ""},
        {"email": "invalid"},
        {"services": []},
        {"services": ["wrong"]},
        {"message": "short"},
        {"message": "x" * 5001},
        {"elapsed_ms": -1},
        {"budget": "wrong"},
        {"attribution": {"gclid": "x" * 300}},
    ],
)
def test_invalid(api, payload, change):
    payload.update(change)
    assert api.post("/api/enquiries/", payload, format="json").status_code == 400
    assert not Enquiry.objects.exists()


@pytest.mark.parametrize(
    "change,score",
    [({"company_website_hp": "spam"}, 100), ({"elapsed_ms": 1}, 50), ({"message": "https://a https://b https://c https://d", "elapsed_ms": 1}, 80)],
)
def test_spam(api, payload, change, score, django_capture_on_commit_callbacks):
    payload.update(change)
    with django_capture_on_commit_callbacks(execute=True):
        assert api.post("/api/enquiries/", payload, format="json").status_code == 201
    enquiry = Enquiry.objects.get()
    assert enquiry.status == "spam" and enquiry.spam_score == score
    assert not EmailJob.objects.exists()


def test_preview(api, payload):
    api.post("/api/enquiries/", payload, format="json", HTTP_X_ENV="preview")
    assert Enquiry.objects.get().is_test


@pytest.mark.parametrize("result", [{"success": False}, {"success": True, "hostname": "evil.example"}])
def test_turnstile_rejects(api, payload, settings, result):
    settings.DEBUG = False
    with patch("enquiries.serializers.requests.post", return_value=Mock(json=lambda: result)):
        response = api.post("/api/enquiries/", payload, format="json")
    assert response.status_code == 400 and "turnstile_token" in response.data


def test_turnstile_network_failure(api, payload, settings):
    import requests

    settings.DEBUG = False
    with patch("enquiries.serializers.requests.post", side_effect=requests.Timeout):
        assert api.post("/api/enquiries/", payload, format="json").status_code == 400


def test_turnstile_success(api, payload, settings):
    settings.DEBUG = False
    with patch("enquiries.serializers.requests.post", return_value=Mock(json=lambda: {"success": True, "hostname": "avrixdigital.co.uk"})):
        assert api.post("/api/enquiries/", payload, format="json").status_code == 201


def test_throttle(api, payload):
    for _ in range(5):
        assert api.post("/api/enquiries/", payload, format="json").status_code == 201
    assert api.post("/api/enquiries/", payload, format="json").status_code == 429


def test_health(api):
    assert api.get("/api/health/").json() == {"status": "ok"}
    with patch("enquiries.views.connection.cursor", side_effect=RuntimeError):
        assert api.get("/api/health/").status_code == 503


def newsletter_payload():
    return {"email": "reader@example.co.uk", "consent_text": "I agree to receive the newsletter.", "privacy_ack": True, "elapsed_ms": 5000}


def test_newsletter_flow(api, django_capture_on_commit_callbacks):
    with django_capture_on_commit_callbacks(execute=True):
        response = api.post("/api/newsletter/", newsletter_payload(), format="json")
    assert response.status_code == 201 and len(mail.outbox) == 1
    subscriber = Subscriber.objects.get()
    assert subscriber.confirmed_at is None
    assert api.get(f"/api/newsletter/confirm/{subscriber.confirm_token}/").url.endswith("/newsletter-confirmed/")
    subscriber.refresh_from_db()
    assert subscriber.confirmed_at is not None
    assert api.get(f"/api/newsletter/unsubscribe/{subscriber.unsubscribe_token}/").url.endswith("/newsletter-unsubscribed/")
    subscriber.refresh_from_db()
    assert subscriber.unsubscribed_at
    assert api.get("/api/newsletter/confirm/invalid/").url.endswith("/newsletter-invalid/")
    assert api.get("/api/newsletter/unsubscribe/invalid/").url.endswith("/newsletter-invalid/")
    subscriber.confirmation_sent_at = timezone.now() - timedelta(days=3)
    subscriber.save()
    assert api.get(f"/api/newsletter/confirm/{subscriber.confirm_token}/").url.endswith("/newsletter-invalid/")


def test_newsletter_spam_consent_duplicates(api):
    data = newsletter_payload()
    data["privacy_ack"] = False
    assert api.post("/api/newsletter/", data, format="json").status_code == 400
    data["privacy_ack"] = True
    data["company_website_hp"] = "bot"
    assert api.post("/api/newsletter/", data, format="json").status_code == 201
    assert not Subscriber.objects.exists()
    data.pop("company_website_hp")
    api.post("/api/newsletter/", data, format="json")
    api.post("/api/newsletter/", data, format="json")
    assert Subscriber.objects.count() == 1
    assert EmailJob.objects.count() == 1
