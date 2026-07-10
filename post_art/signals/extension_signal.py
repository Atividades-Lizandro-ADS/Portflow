from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from ..models import DeliveryExtensionRequest, ChatMessage


@receiver(pre_save, sender=DeliveryExtensionRequest)
def capture_old_extension_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._old_status = None
        return
    try:
        instance._old_status = DeliveryExtensionRequest.objects.get(pk=instance.pk).status
    except DeliveryExtensionRequest.DoesNotExist:
        instance._old_status = None


@receiver(post_save, sender=DeliveryExtensionRequest)
def create_extension_chat_message(sender, instance, created, **kwargs):
    conversation = instance.briefing.conversation

    if created:
        ChatMessage.objects.create(
            conversation=conversation,
            sender=conversation.artist,
            message_type='extension_request',
            related_extension_request=instance,
        )
        return

    old_status = getattr(instance, '_old_status', None)
    if old_status == 'pending' and instance.status in ('accepted', 'declined'):
        ChatMessage.objects.create(
            conversation=conversation,
            sender=conversation.client,
            message_type='extension_response',
            related_extension_request=instance,
        )
