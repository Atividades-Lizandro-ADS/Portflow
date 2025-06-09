from django.forms.models import ModelForm
from .models import PostArt,Profile,Comments,PostImages,UsedPrograms,About,Hiring,Skill
from django.forms import CharField,HiddenInput,BooleanField,ModelMultipleChoiceField,CheckboxSelectMultiple
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

from django.contrib.auth.forms import AuthenticationForm

class PostForm(ModelForm):


    programs=CharField(required=False)
    class Meta:
        model=PostArt
        exclude=["likes","views_number",'used_programs','post_owner']

    def save(self,image_data,used_programs,owner, commit = True):
        post= self.instance
        post.post_owner=owner
        if commit:
            post.save()
            self._save_post_images(post,image_data)
            self._save_used_programs(post,used_programs)
        return post
    
    def clean_post_thumb(self):
        return self.cleaned_data.get('post_thumb')
    
    def _save_post_images(self,post,image_data):
        for fil,caption,a_caption in zip(
            image_data.get("files"),
            image_data.get("captions"),
            image_data.get("accessibility_captions")):
            image=PostImages.objects.create(post_img=fil,acessibility_caption=a_caption,
                                      caption=caption,image_post_owner=post)
            print(image)
            
    def _save_used_programs(self,post,used_programs):
        if used_programs:
            programas=[programa.title() for programa in used_programs]
            usep=UsedPrograms.objects.filter(program_name__in=programas)
            post.used_programs.add(*usep)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        excluir_campos=['post_thumb','marmoview']

        for field_name,field in self.fields.items():
            if field_name not in excluir_campos:
                field.widget.attrs.update({'class':'text-input'})

        self.fields['tittle'].widget.attrs.update({'placeholder':'qual título da sua obra?'})
        self.fields['tittle'].label='Título'
        self.fields['caption'].widget.attrs.update({'placeholder':'uma breve descrição da sua obra'})
        self.fields['caption'].label='Legenda'
        self.fields['description'].widget.attrs.update({'placeholder':'descrição completa de sua obra'})
        self.fields['description'].label='Descrição'
        self.fields['youtube_link'].widget.attrs.update({'placeholder':'link do youtube apresentando sua obra'})
        self.fields['youtube_link'].label='Link YouTube'
        self.fields['art_type'].label='Tipo de Mídia'
        self.fields['category'].label='Categoria'
        self.fields['keywords'].label='Palavras-Chave'
        self.fields['published'].widget=HiddenInput()
        
          
class CommentForm(ModelForm):
    class Meta:
        model=Comments
        fields=['comment_text']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['comment_text'].widget.attrs.update({'class':'text-input textarea-input-height'})

class PostImageForm(ModelForm):
    class Meta:
        model=PostImages
        fields=['post_img','acessibility_caption','caption']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['caption'].widget.attrs.update({'class':'text-input'})
        self.fields['acessibility_caption'].widget.attrs.update({'class':'text-input'})


class UserForm(UserCreationForm):
    class Meta:
        model=User
        fields=['first_name','email','username','password1','password2']
        labels={'first_name':'nome','email':'email','username':'nome de Usuario','password1':'Senha','password2':'Confirmar senha'}

    def __init__(self, request = ..., *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].label="Senha da sua conta"
        for field_name,field in self.fields.items():
            field.widget.attrs.update({'class':'text-input'})

class LoginForm(AuthenticationForm):
    remember_me = BooleanField(required=False , initial=False)

    def __init__(self, request = ..., *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name,field in self.fields.items():
            field.widget.attrs.update({'class':'text-input'})



class ProfileForm(ModelForm):
    class Meta:
        model=Profile
        fields=['user_picture','profile_banner']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['user_picture'].widget.attrs.update({'class':'text-input'})
        self.fields['profile_banner'].widget.attrs.update({'class':'text-input'})
        
class AboutForm(ModelForm):
    programs=CharField(required=False)
    hiring=ModelMultipleChoiceField(
            queryset=Hiring.objects.all(),
            widget=CheckboxSelectMultiple
            )
    skills=ModelMultipleChoiceField(
            queryset=Skill.objects.all(),
            widget=CheckboxSelectMultiple
            )
    class Meta:
        model=About
        exclude=['prof','programs_known']

    def save(self,used_programs, commit = True):

            if commit:
                about=super().save()

                programas=[programa.title() for programa in used_programs]
                usep=UsedPrograms.objects.filter(program_name__in=programas)

                about.programs_known.add(*usep)
            return about