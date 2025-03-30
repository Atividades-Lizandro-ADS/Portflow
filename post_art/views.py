from django.http import JsonResponse
from django.shortcuts import render,HttpResponse,HttpResponseRedirect
from .models import PostArt,UsedPrograms,Profile,Like,PostImages
from .forms import PostForm,CommentForm
from django.contrib.auth.decorators import login_required
from django.urls import reverse

from django.db.models import Q

from django.views.generic import ListView,UpdateView


from .utility import get_object_or_none 




class Index(ListView):
    model=PostArt
    queryset=PostArt.objects.filter(published=True)[:12]
    template_name='post_art/index.html'
    context_object_name='posts'

    def get_queryset(self):
        search=self.request.GET.get('search')
        if search:
            return PostArt.objects.filter(Q(tittle__icontains=search) |
                                           Q(caption__icontains=search) |
                                             Q(description__icontains=search),published=True)[:12]
        return super().get_queryset()
        




def postPost(request):

    form=PostForm(request.POST or None,request.FILES)
    
    if request.method=='POST':
        if form.is_valid():

            #recebendo os dados do input de texto 'programs' e transformando o numa lista com o split
            programas=form.cleaned_data.get('programs')
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

            files=request.FILES.getlist('post_img[]')
            captions=request.POST.getlist('caption[]')
            acessibility_captions=request.POST.getlist('acessibility_caption[]')
            


            for file,caption,a_caption in zip(files,captions,acessibility_captions):
                PostImages.objects.create(post_img=file,acessibility_caption=a_caption,caption=caption,image_post_owner=post)
            return HttpResponseRedirect(reverse('index'))
    return render(request,'post_art/postPost.html',{'form':form})

def post_details(request,post_pk):
    post=PostArt.objects.get(id=post_pk)
    post.increase_view()

    keywords=post.keywords.split("#")
    keywords=filter(None,keywords)

    form=CommentForm()

    favorited=False
    if request.user.is_authenticated:
       profile= request.user.profile
       favorited=profile.saved_posts.contains(post)
       _,liked=get_object_or_none(Like,like_owner=profile,like_post=post)
       

    return render(request,'post_art/post_details.html',{'post':post,'keywords':keywords,'form':form,'favorited':favorited,'liked':liked})


def profile_index(request,profile_pk):
    profile=Profile.objects.get(id=profile_pk)
    published_posts=profile.postart_set.filter(published=True)
    context={'profile':profile,'posts':published_posts}

    if request.user.is_authenticated and profile==request.user.profile:
        context['is_profile_owner']=True
        context['drafts']=profile.postart_set.filter(published=False)
    return render(request,'post_art/profile_page.html',context)


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





