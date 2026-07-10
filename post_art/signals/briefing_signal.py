from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from ..models import Briefing, ChatMessage


@receiver(pre_save, sender=Briefing)
def capture_old_briefing_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._old_status = None
        return
    try:
        instance._old_status = Briefing.objects.get(pk=instance.pk).status
    except Briefing.DoesNotExist:
        instance._old_status = None


@receiver(post_save, sender=Briefing)
def create_briefing_chat_message(sender, instance, created, **kwargs):
    if created:
        ChatMessage.objects.create(
            conversation=instance.conversation,
            sender=instance.conversation.client,
            message_type='briefing_sent',
            related_briefing=instance,
        )
        return

    old_status = getattr(instance, '_old_status', None)
    if old_status == 'pending' and instance.status in ('accepted', 'declined'):
        ChatMessage.objects.create(
            conversation=instance.conversation,
            sender=instance.conversation.artist,
            message_type='briefing_response',
            related_briefing=instance,
        )
