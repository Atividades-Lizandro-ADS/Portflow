from django.db import models
from django.contrib.auth.models import User


class BasePost(models.Model):
    creation_date=models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract=True

class Profile(models.Model):
    user_profile=models.OneToOneField(User,on_delete=models.CASCADE)
    first_name=models.CharField(max_length=70)
    user_picture=models.ImageField(blank=True, upload_to='user/pictures')
    profile_banner=models.ImageField(blank=True,upload_to='user/banners')
    saved_posts=models.ManyToManyField('PostArt',blank=True)

    def __str__(self):
        return self.first_name


class UsedPrograms(models.Model):
    program_name=models.CharField(max_length=100)
    program_logo=models.ImageField(blank=True, upload_to='programs/images')

    def __str__(self):
        return self.program_name
    
    def save(self, *args, **kwargs):
        self.program_name=self.program_name.title()
        return super(UsedPrograms,self).save(*args,**kwargs)
    

class Category(models.Model):
    category_name=models.CharField(max_length=140)

    def __str__(self):
        return self.category_name


        
class PostArt(BasePost):
    art_type_choices=(('2',"2D"),('3',"3D"))


    post_owner=models.ForeignKey(Profile,on_delete=models.CASCADE)
    tittle=models.CharField(max_length=150)
    caption=models.CharField(max_length=250)
    description=models.TextField()
    art_type=models.CharField(default='2D',choices=art_type_choices,max_length=2)
    likes=models.IntegerField(default=0)

    used_programs=models.ManyToManyField(UsedPrograms)
    views=models.IntegerField(default=0)
    category=models.ForeignKey(Category,on_delete=models.SET_NULL, blank=True, null=True)

    class Meta:
        verbose_name="post portfolio"
        verbose_name_plural="posts portfolio"
        ordering=['-id']

    def __str__(self) -> str:
        return self.tittle
