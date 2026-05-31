from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user_profile = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=70)
    user_picture = models.ImageField(blank=True, upload_to='user/pictures')
    profile_banner = models.ImageField(blank=True, upload_to='user/banners')
    saved_posts = models.ManyToManyField('PostArt', blank=True)

    def __str__(self):
        return self.first_name
