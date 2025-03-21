from django.forms.models import ModelForm
from .models import PostArt,Profile
from django.forms import CharField,Textarea,RadioSelect,ModelChoiceField


class PostForm(ModelForm):

    programs=CharField(widget=Textarea)
    #como editar modelchoice para radio button
    #post_owner=ModelChoiceField(queryset=Profile.objects.all(),widget=RadioSelect())
    class Meta:
        model=PostArt
        exclude=["likes","views",'used_programs','post_owner']

    def save(self,owner=None, commit = True):
        post= self.instance
        if owner:
            post.post_owner=owner
        if commit:
            post.save()
        return post
    
    def clean_post_thumb(self):
        print(self.cleaned_data.get('post_thumb'))
        return self.cleaned_data.get('post_thumb')