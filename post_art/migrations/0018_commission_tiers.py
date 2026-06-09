import django.db.models.deletion
import post_art.models.commission_tier
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0017_mature_content'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='commissions_open',
            field=models.BooleanField(default=False),
        ),
        migrations.CreateModel(
            name='CommissionTier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('thumb', models.ImageField(blank=True, null=True, upload_to=post_art.models.commission_tier.commission_thumb_upload_to)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('negotiable', models.BooleanField(default=False)),
                ('negotiation_direction', models.CharField(
                    blank=True,
                    choices=[
                        ('up', 'Pode ficar mais caro'),
                        ('down', 'Pode ficar mais barato'),
                        ('both', 'Pode ficar mais caro ou mais barato'),
                    ],
                    max_length=4,
                    null=True,
                )),
                ('profile', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='commission_tiers',
                    to='post_art.profile',
                )),
            ],
            options={
                'verbose_name': 'tier de comissão',
                'verbose_name_plural': 'tiers de comissão',
                'ordering': ['price'],
            },
        ),
    ]
