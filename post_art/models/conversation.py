from django.db import models


class Conversation(models.Model):
    tier = models.ForeignKey('CommissionTier', on_delete=models.PROTECT, related_name='conversations')
    client = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='client_conversations')
    artist = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='artist_conversations')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('client', 'artist', 'tier')
        verbose_name = 'conversa'
        verbose_name_plural = 'conversas'

    def __str__(self):
        return f'{self.client} ↔ {self.artist} ({self.tier.name})'

    def has_open_briefing(self):
        return self.briefings.filter(status__in=('pending', 'accepted')).exists()

    def can_send_messages(self):
        return self.artist.commissions_open or self.has_open_briefing()
