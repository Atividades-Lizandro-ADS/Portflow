from django.db import models


class DeliveryExtensionRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('accepted', 'Aceito'),
        ('declined', 'Recusado'),
    )

    briefing = models.ForeignKey('Briefing', on_delete=models.CASCADE, related_name='extension_requests')
    current_deadline = models.DateField()
    new_deadline = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'pedido de extensão de prazo'
        verbose_name_plural = 'pedidos de extensão de prazo'
        ordering = ['-created_at']

    def __str__(self):
        return f'Extensão #{self.pk} — {self.briefing}'
