from django.db import models


class ChatMessage(models.Model):
    MESSAGE_TYPE_CHOICES = (
        ('text', 'Texto'),
        ('briefing_sent', 'Briefing enviado'),
        ('briefing_response', 'Resposta ao briefing'),
        ('extension_request', 'Pedido de extensão de prazo'),
        ('extension_response', 'Resposta à extensão de prazo'),
    )

    conversation = models.ForeignKey('Conversation', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='sent_messages')
    body = models.TextField(blank=True)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    related_briefing = models.ForeignKey(
        'Briefing', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages'
    )
    related_extension_request = models.ForeignKey(
        'DeliveryExtensionRequest', on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages'
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'mensagem'
        verbose_name_plural = 'mensagens'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender} @ {self.conversation} [{self.message_type}]'
