from collections import Counter
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from .models import Enquiry


def dashboard_callback(request, context):
    if not request.user.has_perm("enquiries.view_enquiry"):
        return context
    now = timezone.now()
    qs = Enquiry.objects.exclude(status="spam")
    if not settings.DEBUG:
        qs = qs.filter(is_test=False)
    recent = qs.filter(created_at__gte=now - timedelta(days=30))
    context.update(
        {
            "includes_test_enquiries": settings.DEBUG,
            "metrics": [
                ("Today", qs.filter(created_at__date=now.date()).count()),
                ("7 days", qs.filter(created_at__gte=now - timedelta(days=7)).count()),
                ("30 days", recent.count()),
            ],
            "pipeline": Counter(qs.values_list("status", flat=True)).items(),
            "top_services": Counter(s for values in recent.values_list("services", flat=True) for s in values).most_common(5),
            "top_sources": Counter((e.utm_source or e.referrer or "Direct") for e in recent).most_common(5),
            "followups": qs.filter(next_action_at__lte=now).exclude(status__in=["won", "lost"])[:10],
            "latest": qs[:10],
        }
    )
    return context
