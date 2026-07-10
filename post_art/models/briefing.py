from django.db import models


class Briefing(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('accepted', 'Aceito'),
        ('declined', 'Recusado'),
    )

    conversation = models.ForeignKey('Conversation', on_delete=models.CASCADE, related_name='briefings')
    tier = models.ForeignKey('CommissionTier', on_delete=models.PROTECT, related_name='briefings')
    tier_name_snapshot = models.CharField(max_length=100)
    tier_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2)
    request_details = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_deadline = models.DateField()
    deadline = models.DateField(null=True, blank=True)
    decline_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'briefing'
        verbose_name_plural = 'briefings'
        ordering = ['-created_at']

    def __str__(self):
        return f'Briefing #{self.pk} — {self.conversation}'
