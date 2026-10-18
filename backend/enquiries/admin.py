from urllib.parse import quote
from django.conf import settings
from django.contrib import admin, messages
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html, format_html_join
from import_export import resources
from import_export.admin import ExportActionModelAdmin
from unfold.admin import ModelAdmin, TabularInline
from .models import Enquiry, EnquiryActivity, Subscriber
from .constants import SERVICES
from .admin_forms import EnquiryStatusForm


class SafeExportMixin:
    def export_field(self, field, instance, **kwargs):
        value = super().export_field(field, instance, **kwargs)
        # Prevent spreadsheet formula execution in untrusted form input.
        if isinstance(value, str) and value.startswith(("=", "+", "-", "@", "\t", "\r")):
            value = "'" + value
        return value


class EnquiryResource(SafeExportMixin, resources.ModelResource):
    class Meta:
        model = Enquiry
        exclude = ("ip_hash",)


class VisibilityFilter(admin.SimpleListFilter):
    title = "Visibility"
    parameter_name = "visibility"

    def lookups(self, request, model_admin):
        return [("live", "Live enquiries"), ("all", "All including spam/test"), ("spam", "Spam"), ("test", "Preview/test")]

    def queryset(self, request, queryset):
        if self.value() == "all":
            return queryset
        if self.value() == "spam":
            return queryset.filter(status="spam")
        if self.value() == "test":
            return queryset.filter(is_test=True)
        if self.value() != "live" and settings.DEBUG:
            return queryset.exclude(status="spam")
        return queryset.filter(is_test=False).exclude(status="spam")


class ServiceFilter(admin.SimpleListFilter):
    title = "Service"
    parameter_name = "service"

    def lookups(self, request, model_admin):
        return [(s, s.replace("-", " ").title()) for s in SERVICES]

    def queryset(self, request, queryset):
        if self.value():
            # Text lookup works with both SQLite JSON1 and PostgreSQL JSONB.
            from django.db.models import TextField
            from django.db.models.functions import Cast

            return queryset.annotate(service_text=Cast("services", TextField())).filter(service_text__contains='"' + self.value() + '"')
        return queryset


class ActivityInline(TabularInline):
    model = EnquiryActivity
    fields = ("created_at", "actor", "kind", "detail")
    readonly_fields = fields
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Enquiry)
class EnquiryAdmin(ModelAdmin, ExportActionModelAdmin):
    change_form_template = "admin/enquiries/enquiry/change_form.html"
    change_list_template = "admin/enquiries/enquiry/change_list.html"

    class Media:
        js = ("enquiries/admin.js",)
        css = {"all": ("enquiries/admin.css",)}

    def get_urls(self):
        return [path("<uuid:object_id>/panel/", self.admin_site.admin_view(self.detail_panel), name="enquiries_enquiry_panel")] + super().get_urls()

    def detail_panel(self, request, object_id):
        enquiry = get_object_or_404(self.get_queryset(request), pk=object_id)
        if not self.has_view_permission(request, enquiry):
            raise PermissionDenied
        can_change = self.has_change_permission(request, enquiry)
        saved = False
        response_status = 200
        form = EnquiryStatusForm(instance=enquiry)
        if request.method == "POST":
            if not can_change:
                raise PermissionDenied
            with transaction.atomic():
                enquiry = self.get_queryset(request).select_for_update().get(pk=object_id)
                old_status = enquiry.status
                form = EnquiryStatusForm(request.POST, instance=enquiry)
                if form.is_valid():
                    form.save()
                    if old_status != enquiry.status:
                        EnquiryActivity.objects.create(enquiry=enquiry, actor=request.user, kind="status_change", detail=f"{old_status} -> {enquiry.status}")
                        self.log_change(request, enquiry, f"Status: {old_status} -> {enquiry.status}")
                    saved = True
                else:
                    response_status = 400
        elif request.method != "GET":
            from django.http import HttpResponseNotAllowed

            return HttpResponseNotAllowed(["GET", "POST"])
        return TemplateResponse(request, "admin/enquiries/enquiry/panel.html", {
            "enquiry": enquiry, "form": form, "can_change": can_change, "saved": saved,
            "panel_url": reverse("admin:enquiries_enquiry_panel", args=[enquiry.pk]),
            "change_url": reverse("admin:enquiries_enquiry_change", args=[enquiry.pk]),
            "activities": enquiry.activities.select_related("actor")[:20],
        }, status=response_status)

    @admin.display(description="Details")
    def details_link(self, obj):
        return format_html('<a href="{}" data-enquiry-panel="{}">View details</a>', reverse("admin:enquiries_enquiry_change", args=[obj.pk]), reverse("admin:enquiries_enquiry_panel", args=[obj.pk]))

    def response_change(self, request, obj):
        if "_mark_spam" in request.POST:
            old = obj.status
            obj.status = "spam"
            obj.save(update_fields=["status", "updated_at"])
            EnquiryActivity.objects.create(enquiry=obj, actor=request.user, kind="status_change", detail=f"{old} → spam")
            self.message_user(request, "Marked as spam.")
        return super().response_change(request, obj)

    resource_classes = [EnquiryResource]
    list_display = ("created_at", "full_name", "details_link", "company", "service_badges", "budget", "status_badge", "is_test", "owner", "utm_source", "priority", "email_failed")
    list_display_links = ("full_name",)
    list_filter = (
        VisibilityFilter,
        "status",
        ServiceFilter,
        "budget",
        "owner",
        ("created_at", admin.DateFieldListFilter),
        "utm_source",
        "is_test",
        "email_failed",
    )
    search_fields = ("full_name", "email", "company", "message")
    ordering = ("-created_at",)
    inlines = [ActivityInline]
    actions = ["mark_contacted", "mark_qualified", "mark_spam", "assign_to_me", "export_admin_action"]
    pipeline = ("status", "priority", "owner", "next_action_at", "internal_notes")
    attribution = (
        "source_page",
        "landing_page",
        "referrer",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "fbclid",
        "msclkid",
        "ip_hash",
        "user_agent",
        "is_test",
        "spam_score",
    )
    submitted = (
        "created_at",
        "updated_at",
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
        "email_failed",
    )
    readonly_fields = submitted + attribution + ("reply_link",)
    fieldsets = [
        ("Enquiry", {"fields": ("reply_link",) + submitted}),
        ("Pipeline", {"fields": pipeline}),
        ("Attribution", {"fields": attribution}),
    ]

    def has_add_permission(self, request):
        return False

    @admin.display(description="Services")
    def service_badges(self, obj):
        return format_html_join(" ", '<span class="px-2 py-1 rounded bg-gray-100 text-gray-800">{}</span>', ((s,) for s in obj.services))

    @admin.display(description="Status", ordering="status")
    def status_badge(self, obj):
        return format_html("<strong>{}</strong>", obj.get_status_display())

    @admin.display(description="Reply")
    def reply_link(self, obj):
        return format_html('<a href="mailto:{}?subject={}">Reply by email ↗</a>', obj.email, quote("Your AVRIX Digital enquiry"))

    def save_model(self, request, obj, form, change):
        old = Enquiry.objects.get(pk=obj.pk) if change else None
        super().save_model(request, obj, form, change)
        if old:
            for name, kind in [("status", "status_change"), ("owner_id", "assigned"), ("internal_notes", "note")]:
                if getattr(old, name) != getattr(obj, name):
                    EnquiryActivity.objects.create(enquiry=obj, actor=request.user, kind=kind, detail=f"{getattr(old, name)} → {getattr(obj, name)}")

    def transition(self, request, queryset, status=None):
        for obj in queryset:
            old = obj.status if status else obj.owner_id
            if status:
                obj.status = status
            else:
                obj.owner = request.user
            obj.save()
            EnquiryActivity.objects.create(
                enquiry=obj, actor=request.user, kind="status_change" if status else "assigned", detail=f"{old} → {status or request.user.pk}"
            )
        self.message_user(request, "Enquiries updated.", messages.SUCCESS)

    @admin.action(description="Mark contacted")
    def mark_contacted(self, request, queryset):
        self.transition(request, queryset, "contacted")

    @admin.action(description="Mark qualified")
    def mark_qualified(self, request, queryset):
        self.transition(request, queryset, "qualified")

    @admin.action(description="Mark spam")
    def mark_spam(self, request, queryset):
        self.transition(request, queryset, "spam")

    @admin.action(description="Assign to me")
    def assign_to_me(self, request, queryset):
        self.transition(request, queryset)


class SubscriberResource(SafeExportMixin, resources.ModelResource):
    class Meta:
        model = Subscriber
        fields = ("email", "created_at", "source_page", "consent_text", "confirmed_at", "unsubscribed_at")


@admin.register(Subscriber)
class SubscriberAdmin(ModelAdmin, ExportActionModelAdmin):
    resource_classes = [SubscriberResource]
    list_display = ("email", "created_at", "confirmed_at", "unsubscribed_at")
    list_filter = ("confirmed_at", "unsubscribed_at", "created_at")
    search_fields = ("email",)
    readonly_fields = (
        "email",
        "created_at",
        "source_page",
        "consent_text",
        "confirmed_at",
        "confirm_token",
        "unsubscribe_token",
        "confirmation_sent_at",
        "unsubscribed_at",
    )

    def has_add_permission(self, request):
        return False

    @admin.action(description="Unsubscribe selected")
    def unsubscribe(self, request, queryset):
        queryset.update(unsubscribed_at=timezone.now())

    actions = ["export_admin_action", "unsubscribe"]
