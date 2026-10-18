from django.contrib.auth.models import Group, Permission


def create_groups(**kwargs):
    admin, _ = Group.objects.get_or_create(name="Admin")
    sales, _ = Group.objects.get_or_create(name="Sales")
    admin.permissions.set(Permission.objects.all())
    sales.permissions.set(
        Permission.objects.filter(content_type__app_label="enquiries", codename__in=["view_enquiry", "change_enquiry", "view_enquiryactivity"])
    )
