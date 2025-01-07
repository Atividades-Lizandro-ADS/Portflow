from django.forms.models import ModelForm
from .models import PostArt
from django.forms import CharField,Textarea


class PostForm(ModelForm):

    programs=CharField(widget=Textarea)

    class Meta:
        model=PostArt
        exclude=["likes","views","post_owner",'used_programs']