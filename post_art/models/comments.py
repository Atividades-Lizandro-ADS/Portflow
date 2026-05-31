from datetime import datetime
from django.db import models


class Comments(models.Model):
    comment_owner = models.ForeignKey('Profile', on_delete=models.CASCADE)
    comment_post = models.ForeignKey('PostArt', on_delete=models.CASCADE)
    comment_text = models.TextField()
    created = models.DateTimeField(default=datetime.now)

    class Meta:
        ordering = ['-created', '-id']

    def __str__(self):
        return self.comment_text
