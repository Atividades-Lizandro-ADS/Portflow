from django.forms.models import ModelForm
from .models import PostArt,Profile,Comments,PostImages,UsedPrograms
from django.forms import CharField,Textarea,RadioSelect,ModelChoiceField,HiddenInput
from django.core.exceptions import ValidationError


class PostForm(ModelForm):


    programs=CharField(widget=Textarea,required=False)
    class Meta:
        model=PostArt
        exclude=["likes","views_number",'used_programs','post_owner']

    def save(self,files, captions,acessibility_captions,used_programs,owner=None, commit = True):
        post= self.instance
        if owner:
            post.post_owner=owner
        if commit:
            post.save()

                
            
            programas=[programa.title() for programa in used_programs]
            usep=UsedPrograms.objects.filter(program_name__in=programas)

            post.used_programs.add(*usep)

            for file,caption,a_caption in zip(files,captions,acessibility_captions):
                PostImages.objects.create(post_img=file,acessibility_caption=a_caption,caption=caption,image_post_owner=post)


            
        return post
    
    def clean_post_thumb(self):
        return self.cleaned_data.get('post_thumb')
    
        
    
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

