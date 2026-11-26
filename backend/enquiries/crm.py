"""Sync enquiries with the Avrix CRM hub (avrix-marketing).

Outbound: each enquiry is posted to POST {AVRIX_CRM_URL}/api/intake/leads, and later status changes made in
this admin go to /api/intake/status. Requests are signed: X-Avrix-Signature = sha256 HMAC of "{timestamp}.{body}".
Inbound: the hub sends signed "lead.stage_changed" events to /api/crm-webhook/, which update the enquiry status.
"""
import hashlib
import hmac
import json
import logging
import time

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .constants import STATUSES
from .models import Enquiry, EnquiryActivity

logger = logging.getLogger(__name__)

# Enquiry status slug <-> CRM stage name (the "AVRIX Digital" pipeline in the hub).
STAGE_FOR_STATUS = {
    "new": "New", "contacted": "Contacted", "qualified": "Qualified", "proposal-sent": "Proposal sent",
    "won": "Won", "lost": "Lost", "spam": "Spam",
}
STATUS_FOR_STAGE = {v.lower(): k for k, v in STAGE_FOR_STATUS.items()}


def enabled():
    return bool(settings.AVRIX_CRM_URL and settings.AVRIX_CRM_KEY and settings.AVRIX_CRM_SECRET)


def sign(secret, timestamp, body):
    return hmac.new(secret.encode(), f"{timestamp}.{body}".encode(), hashlib.sha256).hexdigest()


def _post(path, payload, idempotency_key=None):
    body = json.dumps(payload, default=str, separators=(",", ":"))
    ts = str(int(time.time()))
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.AVRIX_CRM_KEY}",
        "X-Avrix-Timestamp": ts,
        "X-Avrix-Signature": "sha256=" + sign(settings.AVRIX_CRM_SECRET, ts, body),
    }
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key
    res = requests.post(f"{settings.AVRIX_CRM_URL}{path}", data=body.encode(), headers=headers, timeout=10)
    if res.status_code >= 300:
        raise RuntimeError(f"CRM responded {res.status_code}: {res.text[:200]}")
    return res.json()


def lead_payload(e: Enquiry):
    attribution = {k: getattr(e, k) for k in ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"] if getattr(e, k)}
    if e.landing_page:
        attribution["landing_page"] = e.landing_page
    if e.referrer:
        attribution["referrer"] = e.referrer
    return {
        "externalId": str(e.id),
        "name": e.full_name, "email": e.email, "phone": e.phone or None, "businessName": e.company or None,
        "service": ", ".join(s.replace("-", " ") for s in e.services) or None,
        "budget": e.budget or None, "message": e.message, "source": "website_form",
        "stage": STAGE_FOR_STATUS.get(e.status, "New"),
        "priority": e.priority if e.priority in ("low", "normal", "high") else "normal",
        "attribution": attribution,
        "customFields": {"website": e.website or None, "timeline": e.timeline or None, "preferredContact": e.preferred_contact,
                         "services": e.services, "sourcePage": e.source_page or None},
        "consent": {"marketing": bool(e.marketing_opt_in), "text": "Opted in on avrixdigital.co.uk enquiry form" if e.marketing_opt_in else ""},
        "occurredAt": e.created_at.isoformat(),
    }


def sync_enquiry(enquiry_id):
    """Create the lead in the CRM, or push a status change. Safe to call repeatedly."""
    if not enabled():
        return False
    e = Enquiry.objects.filter(pk=enquiry_id).first()
    if not e or e.is_test:
        return False
    try:
        if not e.crm_synced_at:
            result = _post("/api/intake/leads", lead_payload(e), idempotency_key=f"enquiry-{e.id}")
            Enquiry.objects.filter(pk=e.pk).update(crm_synced_at=timezone.now(), crm_lead_id=str(result.get("leadId", ""))[:64], crm_status=e.status, crm_error="")
        elif e.crm_status != e.status:
            _post("/api/intake/status", {"externalId": str(e.id), "stage": STAGE_FOR_STATUS.get(e.status, "New"), "priority": e.priority if e.priority in ("low", "normal", "high") else None})
            Enquiry.objects.filter(pk=e.pk).update(crm_status=e.status, crm_error="")
        return True
    except Exception as exc:  # network or CRM error: retried by `manage.py sync_to_crm`
        Enquiry.objects.filter(pk=e.pk).update(crm_error=str(exc)[:300])
        logger.warning("CRM sync failed for enquiry %s: %s", e.pk, exc)
        return False


def pending():
    """Enquiries never sent, or whose status changed here since the last sync."""
    from django.db.models import F, Q

    return Enquiry.objects.filter(is_test=False).filter(Q(crm_synced_at__isnull=True) | ~Q(crm_status=F("status"))).order_by("created_at")


def verify(secret, timestamp, header, body: bytes, now=None):
    if not secret or not timestamp or not header:
        return False
    try:
        if abs((now or time.time()) - int(timestamp)) > 300:
            return False
    except ValueError:
        return False
    expected = sign(secret, timestamp, body.decode())
    return hmac.compare_digest(expected, header.removeprefix("sha256="))


def apply_stage_event(event):
    """Handle a signed lead.stage_changed event from the CRM."""
    status = STATUS_FOR_STAGE.get(str(event.get("stage", "")).lower())
    if event.get("event") != "lead.stage_changed" or not status or status not in STATUSES:
        return False
    with transaction.atomic():
        e = Enquiry.objects.select_for_update().filter(pk=event.get("externalId")).first()
        if not e:
            return False
        if e.status != status:
            old = e.status
            e.status = status
            e.crm_status = status  # already in the CRM: do not echo it back
            e.save(update_fields=["status", "crm_status", "updated_at"])
            actor = event.get("actor") or "CRM"
            EnquiryActivity.objects.create(enquiry=e, kind="status_change", detail=f"{old} → {status} (from Avrix CRM, by {actor})")
    return True
