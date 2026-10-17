from dateutil.relativedelta import relativedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone
from enquiries.models import Enquiry, Subscriber


class Command(BaseCommand):
    help = "Delete old non-client enquiries and expired unconfirmed subscriptions."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        cutoff = timezone.now() - relativedelta(months=settings.ENQUIRY_RETENTION_MONTHS)
        records = Enquiry.objects.filter(created_at__lt=cutoff).exclude(status="won")
        count = records.count()
        if not options["dry_run"]:
            records.delete()
            Subscriber.objects.filter(confirmed_at__isnull=True, created_at__lt=timezone.now() - relativedelta(days=7)).delete()
        self.stdout.write(f"{count} enquiries {'eligible' if options['dry_run'] else 'deleted'}.")
