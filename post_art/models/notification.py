from django.db import models


class Notification(models.Model):
    recipient = models.ForeignKey(
        'Profile',
        related_name='notifications',
        on_delete=models.CASCADE,
    )
    template = models.ForeignKey(
        'NotificationTemplate',
        on_delete=models.PROTECT,
    )
    title = models.CharField(max_length=255)
    actor = models.ForeignKey(
        'Profile',
        null=True,
        blank=True,
        related_name='triggered_notifications',
        on_delete=models.SET_NULL,
    )
    target_post = models.ForeignKey(
        'PostArt',
        null=True,
        blank=True,
        related_name='notifications',
        on_delete=models.CASCADE,
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    extra_data = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notificação'
        verbose_name_plural = 'Notificações'

    def __str__(self):
        return f'[{self.template.code}] → {self.recipient}'

    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])
