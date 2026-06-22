from django.db import migrations

INITIAL_TEMPLATES = [
    {
        'code': 'NEW_LIKE',
        'name': 'Primeiro Like',
        'title_template': '{actor} foi o primeiro a curtir seu post "{post_title}"',
    },
    {
        'code': 'NEW_COMMENT',
        'name': 'Novo Comentário',
        'title_template': '{actor} comentou no seu post "{post_title}"',
    },
    {
        'code': 'POST_MILESTONE',
        'name': 'Marco de Likes',
        'title_template': 'Seu post "{post_title}" chegou a {count} likes!',
    },
    {
        'code': 'NEW_FOLLOWER',
        'name': 'Novo Seguidor',
        'title_template': '{actor} começou a te seguir',
    },
]


def create_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    for tpl in INITIAL_TEMPLATES:
        NotificationTemplate.objects.get_or_create(code=tpl['code'], defaults=tpl)


def delete_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    NotificationTemplate.objects.filter(
        code__in=[t['code'] for t in INITIAL_TEMPLATES]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0015_notification_system'),
    ]

    operations = [
        migrations.RunPython(create_templates, delete_templates),
    ]
