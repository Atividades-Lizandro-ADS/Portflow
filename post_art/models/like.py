from django.db import models

class Like(models.Model):
    like_owner = models.ForeignKey('Profile', on_delete=models.CASCADE)
    like_post = models.ForeignKey('PostArt', on_delete=models.CASCADE)
    like = models.BooleanField(default=True)

    def like_invert(self):
        self.like = not self.like
        self.save()

    def __str__(self):
        return f'{self.like_owner} {self.like_post}'