import secrets
import uuid
from django.conf import settings
from django.db import models
from .constants import BUDGETS, TIMELINES, CONTACTS, STATUSES, PRIORITIES, choices


def token():
    return secrets.token_urlsafe(32)


class Enquiry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    full_name = models.CharField(max_length=120)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=40, blank=True)
    company = models.CharField(max_length=160, blank=True)
    website = models.URLField(blank=True)
    services = models.JSONField(default=list)
    budget = models.CharField(max_length=24, choices=choices(BUDGETS))
    timeline = models.CharField(max_length=24, choices=choices(TIMELINES), blank=True)
    message = models.TextField()
    preferred_contact = models.CharField(max_length=12, choices=choices(CONTACTS), default="email")
    marketing_opt_in = models.BooleanField(default=False)
    privacy_ack = models.BooleanField(default=False)
    status = models.CharField(max_length=24, choices=choices(STATUSES), default="new", db_index=True)
    priority = models.CharField(max_length=10, choices=choices(PRIORITIES), default="normal")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    internal_notes = models.TextField(blank=True)
    next_action_at = models.DateTimeField(null=True, blank=True)
    source_page = models.CharField(max_length=300, blank=True)
    landing_page = models.CharField(max_length=300, blank=True)
    referrer = models.CharField(max_length=300, blank=True)
    utm_source = models.CharField(max_length=150, blank=True)
    utm_medium = models.CharField(max_length=150, blank=True)
    utm_campaign = models.CharField(max_length=150, blank=True)
    utm_term = models.CharField(max_length=150, blank=True)
    utm_content = models.CharField(max_length=150, blank=True)
    gclid = models.CharField(max_length=255, blank=True)
    fbclid = models.CharField(max_length=255, blank=True)
    msclkid = models.CharField(max_length=255, blank=True)
    ip_hash = models.CharField(max_length=64)
    user_agent = models.CharField(max_length=300, blank=True)
    is_test = models.BooleanField(default=False)
    spam_score = models.PositiveSmallIntegerField(default=0)
    email_failed = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} — {self.company or self.email}"


class EnquiryActivity(models.Model):
    enquiry = models.ForeignKey(Enquiry, on_delete=models.CASCADE, related_name="activities")
    created_at = models.DateTimeField(auto_now_add=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    kind = models.CharField(max_length=24, choices=choices(["status_change", "note", "email_sent", "assigned", "email_failed"]))
    detail = models.TextField()

    class Meta:
        ordering = ["-created_at"]


class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    source_page = models.CharField(max_length=300, blank=True)
    consent_text = models.TextField()
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirm_token = models.CharField(max_length=64, default=token, unique=True, editable=False)
    unsubscribe_token = models.CharField(max_length=64, default=token, unique=True, editable=False)
    confirmation_sent_at = models.DateTimeField(null=True, blank=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.email


class EmailJob(models.Model):
    """Durable queue: enqueue in the same transaction as the enquiry."""

    enquiry = models.ForeignKey(Enquiry, null=True, on_delete=models.CASCADE, related_name="email_jobs")
    subscriber = models.ForeignKey(Subscriber, null=True, on_delete=models.CASCADE)
    kind = models.CharField(max_length=20, choices=choices(["team", "reply", "confirm"]))
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveIntegerField(default=0)
    last_error = models.CharField(max_length=300, blank=True)
    claimed_at = models.DateTimeField(null=True, blank=True)


class AdminBootstrapUse(models.Model):
    """Only a digest is persisted; each configured registration token works once."""

    token_hash = models.CharField(max_length=64, primary_key=True)
    used_at = models.DateTimeField(auto_now_add=True)
