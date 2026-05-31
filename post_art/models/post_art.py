from django.db import models
from .base import BasePost
from ..custom_model_fields import YoutubeUrlField, MarmosetFileField


def thumb_upload_to(instance, filename):
    return f'user/{instance.post_owner}/post/thumb_{filename}'


class PostArt(BasePost):
    art_type_choices = (('2', '2D'), ('3', '3D'))

    post_owner = models.ForeignKey('Profile', on_delete=models.CASCADE)
    post_thumb = models.ImageField(upload_to=thumb_upload_to)
    tittle = models.CharField(max_length=150)
    caption = models.CharField(max_length=250)
    description = models.TextField()
    art_type = models.CharField(default='2D', choices=art_type_choices, max_length=2)
    used_programs = models.ManyToManyField('UsedPrograms')
    views_number = models.IntegerField(default=0)
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, blank=True, null=True)
    youtube_link = YoutubeUrlField(null=True, blank=True)
    marmoview = MarmosetFileField(null=True, blank=True)
    keywords = models.TextField(null=True, blank=True)
    published = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'post portfolio'
        verbose_name_plural = 'posts portfolio'
        ordering = ['-id']

    def __str__(self):
        return self.tittle

    def increase_view(self):
        self.views_number += 1
        self.save()

    @property
    def like_num(self):
        likes = self.like_set.filter(like=True).count()
        if likes >= 1000:
            return f'{(likes / 1000):.1f}k'
        return likes

    @property
    def view_number(self):
        if self.views_number >= 1000:
            return f'{(self.views_number / 1000):.1f}k'
        return self.views_number

    @property
    def get_keywords(self):
        return filter(None, self.keywords.split('#'))
