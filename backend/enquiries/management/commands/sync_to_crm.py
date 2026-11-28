from django.core.management.base import BaseCommand
from enquiries import crm


class Command(BaseCommand):
    help = "Send new enquiries, status changes and confirmed newsletter subscribers to the Avrix CRM hub (run every minute; also backfills existing enquiries)."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=200)

    def handle(self, *args, limit=200, **options):
        if not crm.enabled():
            self.stdout.write("AVRIX_CRM_URL / AVRIX_CRM_KEY / AVRIX_CRM_SECRET not set; nothing to do.")
            return
        ok = failed = 0
        for pk in crm.pending().values_list("pk", flat=True)[:limit]:
            if crm.sync_enquiry(pk):
                ok += 1
            else:
                failed += 1
        for pk in crm.pending_subscribers().values_list("pk", flat=True)[:limit]:
            if crm.sync_subscriber(pk):
                ok += 1
            else:
                failed += 1
        self.stdout.write(f"CRM sync: {ok} sent, {failed} failed")
