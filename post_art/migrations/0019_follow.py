import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0018_commission_tiers'),
    ]

    operations = [
        migrations.CreateModel(
            name='Follow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('follower', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='following_set',
                    to='post_art.profile',
                )),
                ('following', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='followers_set',
                    to='post_art.profile',
                )),
            ],
            options={
                'verbose_name': 'seguidor',
                'verbose_name_plural': 'seguidores',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='follow',
            unique_together={('follower', 'following')},
        ),
    ]
