import uuid

from django.db import models

from .validators import validate_attachment_size


def briefing_attachment_upload_to(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    username = instance.briefing.conversation.client.user_profile.username
    conversation_id = instance.briefing.conversation_id
    return f'users/{username}/chat/{conversation_id}/briefings/{uuid.uuid4().hex[:8]}.{ext}'


class BriefingAttachment(models.Model):
    briefing = models.ForeignKey('Briefing', on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=briefing_attachment_upload_to, validators=[validate_attachment_size])
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()

    class Meta:
        verbose_name = 'anexo de briefing'
        verbose_name_plural = 'anexos de briefing'

    def __str__(self):
        return self.original_filename
