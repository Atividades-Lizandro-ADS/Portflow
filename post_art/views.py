from django.http import JsonResponse
from django.shortcuts import render,HttpResponse
from .models import PostArt,UsedPrograms,Profile,Comments
from .forms import PostForm,CommentForm
from django.contrib.auth.decorators import login_required

from django.views.generic import UpdateView





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
    post.increase_view()

    keywords=post.keywords.split("#")
    keywords=filter(None,keywords)

    form=CommentForm()

    if request.user.is_authenticated:
       profile= request.user.profile
       favorited=profile.saved_posts.contains(post)
    

    return render(request,'post_art/post_details.html',{'post':post,'keywords':keywords,'form':form,'favorited':favorited})


def profile_index(request,profile_pk):
    profile=Profile.objects.get(id=profile_pk)
    return HttpResponse(profile)





class add_favorite(UpdateView):
    def get(self, request, *args, **kwargs):

        post_id=request.GET.get('post')
        post=PostArt.objects.get(id=post_id)
        profile=request.user.profile

        if profile.saved_posts.contains(post):
            profile.saved_posts.remove(post)
        else:
            profile.saved_posts.add(post)
        response={}
        response['success']=True

        
        
        return JsonResponse(response)





