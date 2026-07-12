import uuid
from django.db import models


def commission_thumb_upload_to(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    username = instance.profile.user_profile.username
    return f'users/{username}/commissions/{uuid.uuid4().hex[:12]}.{ext}'


class CommissionTier(models.Model):
    NEGOTIATION_DIRECTION_CHOICES = (
        ('up', 'Pode ficar mais caro'),
        ('down', 'Pode ficar mais barato'),
        ('both', 'Pode ficar mais caro ou mais barato'),
    )

    profile = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='commission_tiers')
    name = models.CharField(max_length=100)
    description = models.TextField()
    thumb = models.ImageField(upload_to=commission_thumb_upload_to, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    negotiable = models.BooleanField(default=False)
    negotiation_direction = models.CharField(
        max_length=4,
        choices=NEGOTIATION_DIRECTION_CHOICES,
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'tier de comissão'
        verbose_name_plural = 'tiers de comissão'
        ordering = ['price']

    def __str__(self):
        return f'{self.profile} — {self.name}'
