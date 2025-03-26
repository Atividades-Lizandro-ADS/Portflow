from django.db import models
from django.contrib.auth.models import User
from .custom_model_fields import YoutubeUrlField,MarmosetFileField


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


def thumb_upload_to(instance, filename): 
  
    return f'user/{instance.post_owner}/post/thumb_{filename}' 
def post_images_upload_to(instance,filename):

    return f'user/{instance.image_post_owner}/post/{filename}'


class PostImages(models.Model):
    post_img=models.ImageField(upload_to=post_images_upload_to)
    acessibility_caption=models.CharField(max_length=120)
    caption=models.CharField(max_length=240)
    image_post_owner=models.ForeignKey('PostArt',on_delete=models.CASCADE)

    def __str__(self):
        return self.caption
        
class PostArt(BasePost):
    art_type_choices=(('2',"2D"),('3',"3D"))
    post_owner=models.ForeignKey(Profile,on_delete=models.CASCADE)
    post_thumb=models.ImageField(upload_to=thumb_upload_to)
    tittle=models.CharField(max_length=150)
    caption=models.CharField(max_length=250)
    description=models.TextField()
    art_type=models.CharField(default='2D',choices=art_type_choices,max_length=2)

    used_programs=models.ManyToManyField(UsedPrograms)
    views_number=models.IntegerField(default=0)
    category=models.ForeignKey(Category,on_delete=models.SET_NULL, blank=True, null=True)

    youtube_link=YoutubeUrlField(null=True, blank=True,)
    marmoview=MarmosetFileField(null=True, blank=True)

    keywords=models.TextField(null=True, blank=True)

    published=models.BooleanField(default=True)


    class Meta:
        verbose_name="post portfolio"
        verbose_name_plural="posts portfolio"
        ordering=['-id']

    def __str__(self) -> str:
        return self.tittle
    
    def increase_view(self):
        self.views_number+=1
        self.save()

    @property
    def like_num(self):
        likes= self.like_set.filter(like=True).count()

        if likes>=1000:
           return f'{(likes/1000):.1f}k'
        return likes

    @property
    def view_number(self):
        if self.views_number>=1000:
           return f'{(self.views_number/1000):.1f}k'
        return self.views_number
        


class Comments(models.Model):
    comment_owner=models.ForeignKey(Profile,on_delete=models.CASCADE)
    comment_post=models.ForeignKey(PostArt,on_delete=models.CASCADE)
    comment_text=models.TextField()


    def __str__(self):
        return self.comment_text 
    
class Like(models.Model):
    like_owner=models.ForeignKey(Profile,on_delete=models.CASCADE)
    like_post=models.ForeignKey(PostArt,on_delete=models.CASCADE)
    like=models.BooleanField(default=True)


    def __str__(self):
        return f'{self.like_owner} {self.like_post}'
    