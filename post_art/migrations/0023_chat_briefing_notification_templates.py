from django.db import migrations

TEMPLATES = [
    {
        'code': 'NEW_CHAT_MESSAGE',
        'name': 'Nova mensagem',
        'title_template': '{actor} te enviou uma mensagem.',
    },
    {
        'code': 'BRIEFING_RECEIVED',
        'name': 'Briefing recebido',
        'title_template': '{actor} enviou um briefing de comissão.',
    },
    {
        'code': 'BRIEFING_ACCEPTED',
        'name': 'Briefing aceito',
        'title_template': '{actor} aceitou seu briefing de comissão.',
    },
    {
        'code': 'BRIEFING_DECLINED',
        'name': 'Briefing recusado',
        'title_template': '{actor} recusou seu briefing de comissão.',
    },
    {
        'code': 'EXTENSION_REQUESTED',
        'name': 'Pedido de extensão de prazo',
        'title_template': '{actor} pediu uma extensão de prazo.',
    },
    {
        'code': 'EXTENSION_RESPONDED',
        'name': 'Resposta à extensão de prazo',
        'title_template': '{actor} respondeu ao pedido de extensão de prazo.',
    },
]


def add_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    for t in TEMPLATES:
        NotificationTemplate.objects.get_or_create(code=t['code'], defaults={
            'name': t['name'],
            'title_template': t['title_template'],
        })


def remove_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model('post_art', 'NotificationTemplate')
    NotificationTemplate.objects.filter(code__in=[t['code'] for t in TEMPLATES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('post_art', '0022_chat_and_briefing_system'),
    ]

    operations = [
        migrations.RunPython(add_templates, reverse_code=remove_templates),
    ]
