from django.db import models

def post_images_upload_to(instance, filename):
    return f'user/{instance.image_post_owner}/post/{filename}'

class PostImages(models.Model):
    post_img = models.ImageField(upload_to=post_images_upload_to)
    acessibility_caption = models.CharField(max_length=120)
    caption = models.CharField(max_length=240)
    image_post_owner = models.ForeignKey('PostArt', on_delete=models.CASCADE)

    def __str__(self):
        return self.caption