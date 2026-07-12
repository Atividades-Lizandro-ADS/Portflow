import json

import redis as redis_lib
from django.conf import settings
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from ..models import Briefing, ChatMessage, Notification, NotificationTemplate

_RESPONSE_TEMPLATE_BY_STATUS = {
    'accepted': 'BRIEFING_ACCEPTED',
    'declined': 'BRIEFING_DECLINED',
}


@receiver(pre_save, sender=Briefing)
def capture_old_briefing_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._old_status = None
        return
    try:
        instance._old_status = Briefing.objects.get(pk=instance.pk).status
    except Briefing.DoesNotExist:
        instance._old_status = None


def _publish(recipient, payload):
    channel = f'notifications:user:{recipient.user_profile_id}'
    client = redis_lib.from_url(settings.NOTIFICATIONS_REDIS_URL)
    try:
        client.publish(channel, json.dumps(payload))
    finally:
        client.close()


@receiver(post_save, sender=Briefing)
def create_briefing_sent_message(sender, instance, created, **kwargs):
    if not created:
        return
    ChatMessage.objects.create(
        conversation=instance.conversation,
        sender=instance.conversation.client,
        message_type='briefing_sent',
        related_briefing=instance,
    )


@receiver(post_save, sender=Briefing)
def notify_briefing_response(sender, instance, created, **kwargs):
    if created:
        return
    old_status = getattr(instance, '_old_status', None)
    if old_status != 'pending' or instance.status not in _RESPONSE_TEMPLATE_BY_STATUS:
        return

    client = instance.conversation.client
    artist = instance.conversation.artist

    try:
        _publish(client, {
            'type': 'briefing_updated',
            'briefing_id': instance.pk,
            'conversation_id': instance.conversation_id,
            'status': instance.status,
        })
    except Exception:
        pass

    try:
        template = NotificationTemplate.objects.get(code=_RESPONSE_TEMPLATE_BY_STATUS[instance.status])
    except NotificationTemplate.DoesNotExist:
        return

    notif = Notification.objects.create(
        recipient=client,
        template=template,
        title=template.render_title({'actor': artist.user_profile.username}),
        actor=artist,
        extra_data={'conversation_id': instance.conversation_id, 'briefing_id': instance.pk},
    )

    try:
        _publish(client, {
            'type': 'notification',
            'id': notif.pk,
            'title': notif.title,
            'template_code': notif.template.code,
            'is_read': False,
            'created_at': notif.created_at.isoformat(),
        })
    except Exception:
        pass
