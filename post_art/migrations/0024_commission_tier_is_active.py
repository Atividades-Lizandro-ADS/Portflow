from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0023_chat_briefing_notification_templates'),
    ]

    operations = [
        migrations.AddField(
            model_name='commissiontier',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
