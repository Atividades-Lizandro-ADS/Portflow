from django.db import models
from django.contrib.auth.models import User


def profile_picture_upload_to(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    return f'users/{instance.user_profile.username}/avatar.{ext}'


def profile_banner_upload_to(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    return f'users/{instance.user_profile.username}/banner.{ext}'


class Profile(models.Model):
    user_profile = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=70)
    user_picture = models.ImageField(blank=True, upload_to=profile_picture_upload_to)
    profile_banner = models.ImageField(blank=True, upload_to=profile_banner_upload_to)
    saved_posts = models.ManyToManyField('PostArt', blank=True)

    def __str__(self):
        return self.first_name
