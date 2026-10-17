import pytest
from django.core.cache import cache
from rest_framework.test import APIClient


@pytest.fixture(autouse=True)
def clear_cache(settings):
    settings.DEBUG = True
    cache.clear()


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def payload():
    return {
        "full_name": "Jane Smith",
        "email": "jane@example.co.uk",
        "company": "Example Ltd",
        "services": ["ga4-consulting"],
        "budget": "1k-3k",
        "timeline": "1-3-months",
        "message": "Please help us configure our GA4 property correctly.",
        "privacy_ack": True,
        "marketing_opt_in": False,
        "preferred_contact": "email",
        "elapsed_ms": 5000,
        "company_website_hp": "",
        "attribution": {"utm_source": "google", "gclid": "abc", "landing_page": "/"},
    }
