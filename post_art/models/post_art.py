import uuid
from django.db import models
from .base import BasePost
from ..custom_model_fields import YoutubeUrlField, MarmosetFileField, SketchfabUrlField


def thumb_upload_to(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    username = instance.post_owner.user_profile.username
    return f'users/{username}/thumbs/{uuid.uuid4().hex[:12]}.{ext}'


def marmoview_upload_to(instance, filename):
    username = instance.post_owner.user_profile.username
    return f'users/{username}/marmoviews/{uuid.uuid4().hex[:12]}.mview'


class PostArt(BasePost):
    art_type_choices = (('2', '2D'), ('3', '3D'))
    display_type_choices = (('list', 'Lista'), ('album', 'Album'))

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
    sketchfab_link = SketchfabUrlField(null=True, blank=True)
    marmoview = MarmosetFileField(null=True, blank=True, upload_to=marmoview_upload_to)
    keywords = models.TextField(null=True, blank=True)
    published = models.BooleanField(default=True)
    display_type = models.CharField(max_length=5, choices=display_type_choices, default='list')
    is_mature = models.BooleanField(default=False)

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
