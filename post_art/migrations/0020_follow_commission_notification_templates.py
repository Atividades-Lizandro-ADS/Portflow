from django.db import migrations


def add_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    templates = [
        {
            'code': 'NEW_FOLLOWER',
            'name': 'Novo seguidor',
            'title_template': '{actor} começou a te seguir.',
        },
        {
            'code': 'COMMISSIONS_OPENED',
            'name': 'Comissões abertas',
            'title_template': '{actor} abriu comissões! Acesse o perfil para ver as opções.',
        },
    ]
    for t in templates:
        NotificationTemplate.objects.get_or_create(code=t['code'], defaults={
            'name': t['name'],
            'title_template': t['title_template'],
        })


def remove_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    NotificationTemplate.objects.filter(code__in=['NEW_FOLLOWER', 'COMMISSIONS_OPENED']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0019_follow'),
    ]

    operations = [
        migrations.RunPython(add_templates, reverse_code=remove_templates),
    ]
