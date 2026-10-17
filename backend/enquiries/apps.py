from django.apps import AppConfig
from django.db.models.signals import post_migrate


class EnquiriesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "enquiries"

    def ready(self):
        from .permissions import create_groups

        post_migrate.connect(create_groups, sender=self)
