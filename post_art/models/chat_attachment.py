import uuid

from django.db import models

from .validators import validate_attachment_size


def chat_attachment_upload_to(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    username = instance.message.sender.user_profile.username
    conversation_id = instance.message.conversation_id
    return f'users/{username}/chat/{conversation_id}/{uuid.uuid4().hex[:8]}.{ext}'


class ChatAttachment(models.Model):
    message = models.ForeignKey('ChatMessage', on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=chat_attachment_upload_to, validators=[validate_attachment_size])
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()

    class Meta:
        verbose_name = 'anexo de mensagem'
        verbose_name_plural = 'anexos de mensagem'

    def __str__(self):
        return self.original_filename
