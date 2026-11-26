from django.core.management.base import BaseCommand
from enquiries.emails import send_job
from enquiries import crm
from enquiries.models import EmailJob


class Command(BaseCommand):
    help = "Retry durable unsent email jobs and sync enquiries to the Avrix CRM hub (run every minute)."

    def handle(self, *args, **options):
        for job in EmailJob.objects.filter(sent_at__isnull=True, attempts__lt=10).order_by("created_at")[:100]:
            send_job(job.pk)
        # Same timer also keeps the Avrix CRM hub up to date (no-op unless AVRIX_CRM_* is set).
        if crm.enabled():
            for pk in crm.pending().values_list("pk", flat=True)[:200]:
                crm.sync_enquiry(pk)
