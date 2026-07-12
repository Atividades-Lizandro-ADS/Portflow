import json

import redis as redis_lib
from django.conf import settings
from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from ..models import ChatMessage, NotificationTemplate, Notification

_TEMPLATE_BY_MESSAGE_TYPE = {
    'text': 'NEW_CHAT_MESSAGE',
    'briefing_sent': 'BRIEFING_RECEIVED',
    'extension_request': 'EXTENSION_REQUESTED',
}


def _get_template(code):
    try:
        return NotificationTemplate.objects.get(code=code)
    except NotificationTemplate.DoesNotExist:
        return None


def _recipient_of(message):
    conversation = message.conversation
    return conversation.artist if message.sender == conversation.client else conversation.client


def _publish(recipient, payload):
    channel = f'notifications:user:{recipient.user_profile_id}'
    client = redis_lib.from_url(settings.NOTIFICATIONS_REDIS_URL)
    try:
        client.publish(channel, json.dumps(payload))
    finally:
        client.close()


def _resolve_template_code(message):
    if message.message_type == 'briefing_response' and message.related_briefing:
        return 'BRIEFING_ACCEPTED' if message.related_briefing.status == 'accepted' else 'BRIEFING_DECLINED'
    if message.message_type == 'extension_response' and message.related_extension_request:
        return 'EXTENSION_RESPONDED'
    return _TEMPLATE_BY_MESSAGE_TYPE.get(message.message_type)


def _is_viewing_conversation(recipient, conversation_id):
    return cache.get(f'chat-viewing:{recipient.pk}') == conversation_id


def _publish_notification(recipient, notif):
    try:
        _publish(recipient, {
            'type': 'notification',
            'id': notif.pk,
            'title': notif.title,
            'template_code': notif.template.code,
            'is_read': False,
            'created_at': notif.created_at.isoformat(),
        })
    except Exception:
        pass


def _notify_new_text_message(recipient, instance, template):
    existing = Notification.objects.filter(
        recipient=recipient,
        template=template,
        is_read=False,
        extra_data__conversation_id=instance.conversation_id,
    ).first()

    if existing:
        now = timezone.now()
        Notification.objects.filter(pk=existing.pk).update(
            created_at=now,
            extra_data={'conversation_id': instance.conversation_id, 'chat_message_id': instance.pk},
        )
        existing.created_at = now
        _publish_notification(recipient, existing)
        return

    notif = Notification.objects.create(
        recipient=recipient,
        template=template,
        title=template.render_title({'actor': instance.sender.user_profile.username}),
        actor=instance.sender,
        extra_data={'conversation_id': instance.conversation_id, 'chat_message_id': instance.pk},
    )
    _publish_notification(recipient, notif)


@receiver(post_save, sender=ChatMessage)
def notify_chat_message(sender, instance, created, **kwargs):
    if not created:
        return

    recipient = _recipient_of(instance)
    if recipient == instance.sender:
        return

    try:
        _publish(recipient, {
            'type': 'chat_message',
            'id': instance.pk,
            'conversation_id': instance.conversation_id,
            'sender_id': instance.sender_id,
            'message_type': instance.message_type,
            'body': instance.body,
            'created_at': instance.created_at.isoformat(),
        })
    except Exception:
        pass

    if _is_viewing_conversation(recipient, instance.conversation_id):
        return

    template_code = _resolve_template_code(instance)
    if not template_code:
        return

    template = _get_template(template_code)
    if not template:
        return

    if instance.message_type == 'text':
        _notify_new_text_message(recipient, instance, template)
        return

    notif = Notification.objects.create(
        recipient=recipient,
        template=template,
        title=template.render_title({'actor': instance.sender.user_profile.username}),
        actor=instance.sender,
        extra_data={'conversation_id': instance.conversation_id, 'chat_message_id': instance.pk},
    )
    _publish_notification(recipient, notif)
