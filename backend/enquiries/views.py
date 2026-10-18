from datetime import timedelta
from django.conf import settings
from django.db import transaction, connection
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Subscriber, EmailJob
from .serializers import EnquirySerializer, NewsletterSerializer
from .throttles import private_ip
from .emails import dispatch


class EnquiryCreate(APIView):
    throttle_scope = "enquiries"

    def post(self, request):
        if not settings.PUBLIC_FORMS_ENABLED:
            return Response({"message": "Online enquiries will be available soon."}, status=503)
        serializer = EnquirySerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            enquiry = serializer.save(
                ip_hash=private_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
                is_test=request.headers.get("X-Env", "production") != "production",
            )
            if enquiry.status != "spam":
                jobs = [EmailJob.objects.create(enquiry=enquiry, kind=kind).pk for kind in ["team", "reply"]]
                transaction.on_commit(lambda: dispatch(jobs))
        return Response({"id": str(enquiry.id), "message": "Thanks, we'll be in touch within 1 working day."}, status=201)


class NewsletterCreate(APIView):
    throttle_scope = "newsletter"

    def post(self, request):
        if not settings.PUBLIC_FORMS_ENABLED:
            return Response({"message": "Newsletter sign-ups will be available soon."}, status=503)
        serializer = NewsletterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if serializer.spam_score(data) >= 50:
            return Response({"message": "Check your email to confirm."}, status=201)
        with transaction.atomic():
            subscriber, _ = Subscriber.objects.get_or_create(
                email=data["email"].lower(), defaults={"source_page": data.get("source_page", ""), "consent_text": data["consent_text"]}
            )
            # Do not disclose membership or send repeated unsolicited confirmations.
            if (not subscriber.confirmed_at or subscriber.unsubscribed_at) and (
                not subscriber.confirmation_sent_at or subscriber.confirmation_sent_at < timezone.now() - timedelta(hours=24)
            ):
                from .models import token

                subscriber.confirm_token = token()
                subscriber.confirmation_sent_at = timezone.now()
                subscriber.consent_text = data["consent_text"]
                subscriber.source_page = data.get("source_page", "")
                subscriber.save()
                job = EmailJob.objects.create(subscriber=subscriber, kind="confirm")
                transaction.on_commit(lambda: dispatch([job.pk]))
        return Response({"message": "Check your email to confirm."}, status=201)


class NewsletterConfirm(APIView):
    def get(self, request, token):
        subscriber = Subscriber.objects.filter(confirm_token=token).first()
        if not subscriber or not subscriber.confirmation_sent_at or subscriber.confirmation_sent_at < timezone.now() - timedelta(hours=48):
            return redirect(settings.SITE_URL + "/newsletter-invalid/")
        from .models import token as new_token

        subscriber.confirm_token = new_token()
        subscriber.confirmed_at = timezone.now()
        subscriber.unsubscribed_at = None
        subscriber.save(update_fields=["confirmed_at", "unsubscribed_at", "confirm_token"])
        return redirect(settings.SITE_URL + "/newsletter-confirmed/")


class NewsletterUnsubscribe(APIView):
    def get(self, request, token):
        subscriber = Subscriber.objects.filter(unsubscribe_token=token).first()
        if not subscriber:
            return redirect(settings.SITE_URL + "/newsletter-invalid/")
        subscriber.unsubscribed_at = timezone.now()
        subscriber.save(update_fields=["unsubscribed_at"])
        return redirect(settings.SITE_URL + "/newsletter-unsubscribed/")


class Health(APIView):
    throttle_classes = []

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            return Response({"status": "unavailable"}, status=503)
        return Response({"status": "ok"})
