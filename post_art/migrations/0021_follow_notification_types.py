from django.db import migrations


def add_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    templates = [
        {
            'code': 'FIRST_FOLLOWER',
            'name': 'Primeiro seguidor',
            'title_template': '{actor} é seu primeiro seguidor!',
        },
        {
            'code': 'FOLLOWER_MILESTONE',
            'name': 'Marco de seguidores',
            'title_template': 'Você atingiu {count} seguidores!',
        },
        {
            'code': 'NOTABLE_FOLLOWER',
            'name': 'Seguidor notável',
            'title_template': '{actor}, que tem {followers_count} seguidores, começou a te seguir!',
        },
    ]
    for t in templates:
        NotificationTemplate.objects.get_or_create(code=t['code'], defaults={
            'name': t['name'],
            'title_template': t['title_template'],
        })


def remove_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    NotificationTemplate.objects.filter(
        code__in=['FIRST_FOLLOWER', 'FOLLOWER_MILESTONE', 'NOTABLE_FOLLOWER']
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0020_follow_commission_notification_templates'),
    ]

    operations = [
        migrations.RunPython(add_templates, reverse_code=remove_templates),
    ]
