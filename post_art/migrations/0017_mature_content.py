from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0016_initial_notification_templates'),
    ]

    operations = [
        migrations.AddField(
            model_name='postart',
            name='is_mature',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='postimages',
            name='is_mature',
            field=models.BooleanField(default=False),
        ),
    ]
