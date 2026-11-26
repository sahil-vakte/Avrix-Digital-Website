from django.urls import path
from .views import CrmWebhook, EnquiryCreate, NewsletterCreate, NewsletterConfirm, NewsletterUnsubscribe, Health

urlpatterns = [
    path("enquiries/", EnquiryCreate.as_view()),
    path("newsletter/", NewsletterCreate.as_view()),
    path("newsletter/confirm/<str:token>/", NewsletterConfirm.as_view()),
    path("newsletter/unsubscribe/<str:token>/", NewsletterUnsubscribe.as_view()),
    path("health/", Health.as_view()),
    path("crm-webhook/", CrmWebhook.as_view()),
]
