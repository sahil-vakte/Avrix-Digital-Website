from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("enquiries", "0003_enquiry_crm_sync")]
    operations = [
        migrations.AddField(model_name="subscriber", name="name", field=models.CharField(blank=True, max_length=120)),
        migrations.AddField(model_name="subscriber", name="crm_synced_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="subscriber", name="crm_lead_id", field=models.CharField(blank=True, max_length=64)),
        migrations.AddField(model_name="subscriber", name="crm_unsubscribe_synced_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="subscriber", name="crm_error", field=models.CharField(blank=True, max_length=300)),
    ]
