from django.shortcuts import render,HttpResponse
from .models import PostArt,UsedPrograms,Profile,Comments
from .forms import PostForm,CommentForm
from django.contrib.auth.decorators import login_required

from rest_framework import generics,permissions,authentication
from rest_framework import viewsets

from .serializers import PostArtSerializers,PostArtSerializerRefresh,CommentSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


def Index(request):
    posts=PostArt.objects.all()[:12]
    return render(request,'post_art/index.html',{'posts':posts})



def postPost(request):

    form=PostForm(request.POST or None,request.FILES)
    
    if request.method=='POST':
        if form.is_valid():

            #recebendo os dados do input de texto 'programs' e transformando o numa lista com o split
            programas=form.cleaned_data['programs']
            programas=programas.split(';')

            #filtrando os objetos a partir da lista acima, todos os objetos encontrados no db que correspondam
            #a algum objeto acima serão trazidos
            usep=UsedPrograms.objects.filter(program_name__in=programas)
            
            
            #adicionando a instancia do formulario o profile do usuario logado
            post=form.save(owner=request.user.profile)

            #foi necessário salvar o objeto para

            #o metodo add adiciona objetos do tipo UsedPrograms a lista de manytomany
            #add recebe varios argumentos, podemos passar uma lista se utilizarmos o * antes dela
            post.used_programs.add(*usep)
    return render(request,'post_art/postPost.html',{'form':form})

@login_required()
def post_details(request,post_pk):
    post=PostArt.objects.get(id=post_pk)

    keywords=post.keywords.split("#")
    keywords=filter(None,keywords)

    form=CommentForm()
    

    return render(request,'post_art/post_details.html',{'post':post,'keywords':keywords,'form':form})


def profile_index(request,profile_pk):
    profile=Profile.objects.get(id=profile_pk)
    return HttpResponse(profile)











"""API v1"""


class PostsArtView(generics.ListCreateAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializers


class PaginationCustom(PageNumberPagination):
    page_size=12

class PostsArtViewRefresh(generics.ListCreateAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializerRefresh
    pagination_class=PaginationCustom

class PostArtView(generics.RetrieveUpdateDestroyAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializers


class add_comment(generics.CreateAPIView):
    serializer_class=CommentSerializer
    authentication_classes=[authentication.SessionAuthentication]
    permission_classes=[permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(comment_owner=self.request.user.profile)
    
    def create(self, request, *args, **kwargs):
        response= super().create(request, *args, **kwargs)

        response.data['owner']={
            'user_picture':request.user.profile.user_picture.url,
            'username':request.user.profile.first_name,
            'user_id':request.user.profile.id
        }
        return response


"""API v2"""

class PostArtViewset(viewsets.ModelViewSet):
    queryset=PostArt.objects.all()
    serializer_class=PostArtSerializers