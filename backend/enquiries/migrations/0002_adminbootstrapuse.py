from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("enquiries", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="AdminBootstrapUse",
            fields=[
                ("token_hash", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("used_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
