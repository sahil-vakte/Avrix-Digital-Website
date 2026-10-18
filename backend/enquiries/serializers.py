import re
import requests
from django.conf import settings
from rest_framework import serializers
from .models import Enquiry
from .constants import SERVICES, BUDGETS, TIMELINES, CONTACTS
from .throttles import client_ip


class AttributionSerializer(serializers.Serializer):
    landing_page = serializers.CharField(max_length=300, required=False, allow_blank=True)
    referrer = serializers.CharField(max_length=300, required=False, allow_blank=True)
    utm_source = serializers.CharField(max_length=150, required=False, allow_blank=True)
    utm_medium = serializers.CharField(max_length=150, required=False, allow_blank=True)
    utm_campaign = serializers.CharField(max_length=150, required=False, allow_blank=True)
    utm_term = serializers.CharField(max_length=150, required=False, allow_blank=True)
    utm_content = serializers.CharField(max_length=150, required=False, allow_blank=True)
    gclid = serializers.CharField(max_length=255, required=False, allow_blank=True)
    fbclid = serializers.CharField(max_length=255, required=False, allow_blank=True)
    msclkid = serializers.CharField(max_length=255, required=False, allow_blank=True)


class SpamFields(serializers.Serializer):
    turnstile_token = serializers.CharField(max_length=2048, write_only=True, required=False, allow_blank=True)
    company_website_hp = serializers.CharField(max_length=500, write_only=True, required=False, allow_blank=True)
    elapsed_ms = serializers.IntegerField(min_value=0, max_value=2147483647, write_only=True)

    def validate(self, attrs):
        if attrs.get("company_website_hp"):
            return attrs
        if not settings.DEBUG:
            try:
                result = requests.post(
                    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                    data={
                        "secret": settings.TURNSTILE_SECRET_KEY,
                        "response": attrs.get("turnstile_token", ""),
                        "remoteip": client_ip(self.context["request"]),
                    },
                    timeout=5,
                ).json()
                valid = result.get("success") is True and result.get("hostname") in settings.TURNSTILE_HOSTNAMES
            except (requests.RequestException, ValueError):
                valid = False
            if not valid:
                raise serializers.ValidationError({"turnstile_token": ["Security check failed. Please try again."]})
        return attrs

    def spam_score(self, attrs):
        score = 100 if attrs.get("company_website_hp") else 0
        score += 50 if attrs.get("elapsed_ms", 0) < 3000 else 0
        score += 30 if len(re.findall(r"https?://", attrs.get("message", ""))) > 3 else 0
        return score


class EnquirySerializer(SpamFields, serializers.ModelSerializer):
    services = serializers.ListField(child=serializers.ChoiceField(choices=SERVICES), min_length=1, max_length=len(SERVICES))
    budget = serializers.ChoiceField(choices=BUDGETS)
    timeline = serializers.ChoiceField(choices=TIMELINES, required=False, allow_blank=True)
    preferred_contact = serializers.ChoiceField(choices=CONTACTS, default="email")
    message = serializers.CharField(min_length=20, max_length=5000)
    privacy_ack = serializers.BooleanField(required=True)
    attribution = AttributionSerializer(required=False, write_only=True)

    class Meta:
        model = Enquiry
        fields = [
            "full_name",
            "email",
            "phone",
            "company",
            "website",
            "services",
            "budget",
            "timeline",
            "message",
            "preferred_contact",
            "marketing_opt_in",
            "privacy_ack",
            "source_page",
            "attribution",
            "turnstile_token",
            "company_website_hp",
            "elapsed_ms",
        ]

    def validate_privacy_ack(self, value):
        if value is not True:
            raise serializers.ValidationError("Please acknowledge the privacy policy.")
        return value

    def validate_email(self, value):
        return value.lower()

    def create(self, validated_data):
        score = self.spam_score(validated_data)
        attribution = validated_data.pop("attribution", {})
        for key in ["turnstile_token", "company_website_hp", "elapsed_ms"]:
            validated_data.pop(key, None)
        return Enquiry.objects.create(**validated_data, **attribution, spam_score=score, status="spam" if score >= 50 else "new")


class NewsletterSerializer(SpamFields):
    email = serializers.EmailField(max_length=254)
    source_page = serializers.CharField(max_length=300, required=False, allow_blank=True)
    consent_text = serializers.CharField(min_length=10, max_length=1000)
    privacy_ack = serializers.BooleanField()

    def validate_privacy_ack(self, value):
        if value is not True:
            raise serializers.ValidationError("Consent is required.")
        return value
