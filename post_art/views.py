from django.shortcuts import render,HttpResponse
from .models import PostArt,UsedPrograms
from .forms import PostForm
from django.contrib.auth.decorators import login_required

from rest_framework import generics
from rest_framework import viewsets

from .serializers import PostArtSerializers



def Index(request):
    posts=PostArt.objects.all()
    return render(request,'post_art/index.html',{'posts':posts})



def postPost(request):

    form=PostForm(request.POST or None)
    
    if request.method=='POST':
        if form.is_valid():

            #recebendo os dados do input de texto 'programs' e transformando o numa lista com o split
            programas=form.cleaned_data['programs']
            programas=programas.split(';')

            #filtrando os objetos a partir da lista acima, todos os objetos encontrados no db que correspondam
            #a algum objeto acima serão trazidos
            usep=UsedPrograms.objects.filter(program_name__in=programas)
            
            
            #adicionando a instancia do formulario o profile do usuario logado
            form.instance.post_owner=request.user.profile
            post=form.save()
            #foi necessário salvar o objeto para

            #o metodo add adiciona objetos do tipo UsedPrograms a lista de manytomany
            #add recebe varios argumentos, podemos passar uma lista se utilizarmos o * antes dela
            post.used_programs.add(*usep)
            post.save()
        form=PostForm()
    return render(request,'post_art/postPost.html',{'form':form})

@login_required()
def post_details(request,post_pk):
    post=PostArt.objects.get(id=post_pk)

    keywords=post.keywords.split("#")
    keywords=filter(None,keywords)
    

    return render(request,'post_art/post_details.html',{'post':post,'keywords':keywords})














"""API v1"""


class PostsArtView(generics.ListCreateAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializers

class PostArtView(generics.RetrieveUpdateDestroyAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializers


"""API v2"""

class PostArtViewset(viewsets.ModelViewSet):
    queryset=PostArt.objects.all()
    serializer_class=PostArtSerializers