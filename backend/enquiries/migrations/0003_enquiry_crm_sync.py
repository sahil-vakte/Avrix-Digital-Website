from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("enquiries", "0002_adminbootstrapuse")]
    operations = [
        migrations.AddField(model_name="enquiry", name="crm_synced_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="enquiry", name="crm_lead_id", field=models.CharField(blank=True, max_length=64)),
        migrations.AddField(model_name="enquiry", name="crm_status", field=models.CharField(blank=True, max_length=24)),
        migrations.AddField(model_name="enquiry", name="crm_error", field=models.CharField(blank=True, max_length=300)),
    ]
