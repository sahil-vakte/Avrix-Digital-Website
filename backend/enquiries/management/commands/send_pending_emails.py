from django.core.management.base import BaseCommand
from enquiries.emails import send_job
from enquiries.models import EmailJob


class Command(BaseCommand):
    help = "Retry durable unsent email jobs (run every minute)."

    def handle(self, *args, **options):
        for job in EmailJob.objects.filter(sent_at__isnull=True, attempts__lt=10).order_by("created_at")[:100]:
            send_job(job.pk)
