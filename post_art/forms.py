from django.forms.models import ModelForm
from .models import PostArt,Profile
from django.forms import CharField,Textarea,RadioSelect,ModelChoiceField


class PostForm(ModelForm):

    programs=CharField(widget=Textarea)
    #como editar modelchoice para radio button
    #post_owner=ModelChoiceField(queryset=Profile.objects.all(),widget=RadioSelect())
    class Meta:
        model=PostArt
        exclude=["likes","views",'used_programs']