from django.db.models.signals import post_save, post_delete
from django.contrib.auth.models import User
from ..models import Profile, About


def createUser(sender, instance, created, **kwargs):
    if created:
        user = instance
        profile = Profile.objects.create(first_name=instance.username, user_profile=user)
        About.objects.create(prof=profile)


def deleteUser(sender, instance, **kwargs):
    try:
        user = instance.user_profile
        user.delete()
    except:
        print('user não encontrado')


post_save.connect(createUser, sender=User)
post_delete.connect(deleteUser, sender=Profile)
