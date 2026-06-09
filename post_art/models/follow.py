from django.db import models


class Follow(models.Model):
    follower = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='following_set')
    following = models.ForeignKey('Profile', on_delete=models.CASCADE, related_name='followers_set')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']
        verbose_name = 'seguidor'
        verbose_name_plural = 'seguidores'

    def __str__(self):
        return f'{self.follower} → {self.following}'
