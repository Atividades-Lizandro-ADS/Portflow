import uuid
from django.db import models

CELL_SIZE_CHOICES = (('1/3', '1/3'), ('2/3', '2/3'), ('3/3', '3/3'))


def post_images_upload_to(instance, filename):
    ext = filename.rsplit('.', 1)[-1] if '.' in filename else 'jpg'
    username = instance.image_post_owner.post_owner.user_profile.username
    post_id = instance.image_post_owner.pk
    return f'users/{username}/{post_id}/images/{uuid.uuid4().hex[:8]}.{ext}'


class PostImages(models.Model):
    post_img = models.ImageField(upload_to=post_images_upload_to)
    acessibility_caption = models.CharField(max_length=120)
    caption = models.CharField(max_length=240)
    image_post_owner = models.ForeignKey('PostArt', on_delete=models.CASCADE)
    cell_size_x = models.CharField(max_length=3, choices=CELL_SIZE_CHOICES, default='1/3')
    cell_size_y = models.CharField(max_length=3, choices=CELL_SIZE_CHOICES, default='1/3')

    def __str__(self):
        return self.caption
