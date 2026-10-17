import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import close_old_connections, transaction
from django.template.loader import render_to_string
from django.utils import timezone
from .models import EmailJob, Enquiry, EnquiryActivity

logger = logging.getLogger(__name__)
pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="avrix-email")


def send_job(job_id):
    with transaction.atomic():
        job = EmailJob.objects.select_for_update().get(pk=job_id)
        if job.sent_at or (job.claimed_at and job.claimed_at > timezone.now() - timedelta(minutes=10)):
            return
        job.claimed_at = timezone.now()
        job.attempts += 1
        job.save(update_fields=["claimed_at", "attempts"])
    try:
        context = {"site_url": settings.SITE_URL, "booking_url": settings.BOOKING_URL, "brand": "AVRIX Digital"}
        if job.enquiry_id:
            enquiry = job.enquiry
            context.update(
                {
                    "enquiry": enquiry,
                    "details": [(f.verbose_name, getattr(enquiry, f.name)) for f in Enquiry._meta.fields if f.name not in ["ip_hash", "internal_notes"]],
                    "admin_url": f"{settings.API_URL}/{settings.ADMIN_URL}enquiries/enquiry/{enquiry.id}/change/",
                }
            )
            if job.kind == "team":
                subject = f"New enquiry: {', '.join(enquiry.services)} — {enquiry.full_name} ({enquiry.company})"
                recipients, reply_to = settings.ENQUIRY_NOTIFY_TO, [enquiry.email]
            else:
                subject = "Thanks for getting in touch with AVRIX Digital"
                recipients, reply_to = [enquiry.email], settings.ENQUIRY_NOTIFY_TO
        else:
            subscriber = job.subscriber
            subject = "Confirm your AVRIX Digital newsletter subscription"
            recipients, reply_to = [subscriber.email], settings.ENQUIRY_NOTIFY_TO
            context.update(
                {
                    "confirm_url": f"{settings.API_URL}/api/newsletter/confirm/{subscriber.confirm_token}/",
                    "unsubscribe_url": f"{settings.API_URL}/api/newsletter/unsubscribe/{subscriber.unsubscribe_token}/",
                }
            )
        message = EmailMultiAlternatives(
            subject.replace("\n", " ").replace("\r", " "),
            render_to_string(f"emails/{job.kind}.txt", context),
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            reply_to=reply_to,
        )
        message.attach_alternative(render_to_string(f"emails/{job.kind}.html", context), "text/html")
        message.send(fail_silently=False)
        job.sent_at = timezone.now()
        job.last_error = ""
        if job.enquiry_id:
            EnquiryActivity.objects.create(enquiry_id=job.enquiry_id, kind="email_sent", detail=job.kind)
            Enquiry.objects.filter(pk=job.enquiry_id).update(
                email_failed=EmailJob.objects.filter(enquiry_id=job.enquiry_id).exclude(pk=job.pk).exclude(last_error="").exists()
            )
    except Exception as exc:
        # Store the error class only; SMTP messages can contain personal data.
        job.last_error = type(exc).__name__
        logger.error("Email job %s failed: %s", job_id, type(exc).__name__)
        if job.enquiry_id:
            Enquiry.objects.filter(pk=job.enquiry_id).update(email_failed=True)
            EnquiryActivity.objects.create(enquiry_id=job.enquiry_id, kind="email_failed", detail=job.kind + ": " + type(exc).__name__)
    finally:
        job.claimed_at = None
        job.save(update_fields=["sent_at", "last_error", "claimed_at"])


def _worker(ids):
    close_old_connections()
    try:
        for job_id in ids:
            send_job(job_id)
    finally:
        close_old_connections()


def dispatch(ids):
    if settings.EMAIL_ASYNC:
        pool.submit(_worker, ids)
    else:
        for job_id in ids:
            send_job(job_id)
