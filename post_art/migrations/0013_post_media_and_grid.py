import post_art.custom_model_fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0012_alter_comments_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='postart',
            name='display_type',
            field=models.CharField(
                choices=[('list', 'Lista'), ('album', 'Album')],
                default='list',
                max_length=5,
            ),
        ),
        migrations.AddField(
            model_name='postart',
            name='sketchfab_link',
            field=post_art.custom_model_fields.SketchfabUrlField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='postimages',
            name='cell_size_x',
            field=models.CharField(
                choices=[('1/3', '1/3'), ('2/3', '2/3'), ('3/3', '3/3')],
                default='1/3',
                max_length=3,
            ),
        ),
        migrations.AddField(
            model_name='postimages',
            name='cell_size_y',
            field=models.CharField(
                choices=[('1/3', '1/3'), ('2/3', '2/3'), ('3/3', '3/3')],
                default='1/3',
                max_length=3,
            ),
        ),
    ]
