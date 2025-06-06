from django.shortcuts import HttpResponseRedirect
from .models import PostArt,Profile,Like,About
from .forms import PostForm,CommentForm,PostImageForm,LoginForm,UserForm,ProfileForm,AboutForm
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.db.models import Q

from django.views.generic import ListView,UpdateView,DetailView,FormView
from django.contrib.auth.views import LogoutView,LoginView
from .utility import get_object_or_none,owned_by_request
from django.contrib.auth import login,authenticate,logout

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
        

@method_decorator(login_required,name='dispatch')
class PostPost(FormView):
    form_class=PostForm
    template_name='post_art/postPost.html'

    def get_form_kwargs(self):
        kwargs= super().get_form_kwargs()
        kwargs.update({'files':self.request.FILES})
        return kwargs
    
    def form_valid(self, form):  
        files=self.request.FILES.getlist('post_img[]')
        captions=self.request.POST.getlist('caption[]')
        acessibility_captions=self.request.POST.getlist('acessibility_caption[]')

        programs=self.request.POST.getlist('used_programs[]')

        post=form.save(files,captions,acessibility_captions,used_programs=programs,owner=self.request.user.profile)   
        return HttpResponseRedirect(reverse('index'))
    
@method_decorator(login_required,name='dispatch')
class UpdatePostArt(UpdateView):
    template_name='post_art/postPost_update.html'
    model=PostArt
    form_class=PostForm
    pk_url_kwarg='post_pk'

    def dispatch(self, request, *args, **kwargs):
        context=self.get_object()
        owned=owned_by_request(request=self.request,obj_profile=context.post_owner)
        if owned != True:
            return owned
        return super().dispatch(request, *args, **kwargs)
        
        
    def get_context_data(self, **kwargs):
        context= super().get_context_data(**kwargs)
        images=context.get('object').postimages_set.all()

        context['img_forms']=[]

        for image in images:
            con={'img_form':PostImageForm(instance=image)}
            context['img_forms'].append(con)

        return context
    
    def form_valid(self, form):
        files=self.request.FILES.getlist('post_img[]')
        captions=self.request.POST.getlist('caption[]')
        acessibility_captions=self.request.POST.getlist('acessibility_caption[]')

        programs=self.request.POST.getlist('used_programs[]')

        form.save(files,captions,acessibility_captions,used_programs=programs,owner=self.request.user.profile)
        
        url=self.get_success_url()
        return HttpResponseRedirect(url)
    
    def get_success_url(self):
        url=reverse('post_details',kwargs={'post_pk':self.kwargs.get('post_pk')})
        return url
    

class PostDetails(DetailView):
    template_name='post_art/post_details.html'
    model=PostArt
    pk_url_kwarg='post_pk'
    context_object_name='post'

    def get_context_data(self, **kwargs):
        context= super().get_context_data(**kwargs)
        post=context.get('post')
        post.increase_view()
        form=CommentForm()
        favorited=False
        liked=None
        if self.request.user.is_authenticated:
            profile= self.request.user.profile
            favorited=profile.saved_posts.contains(post)
            _,liked=get_object_or_none(Like,like_owner=profile,like_post=post,like=True)
        
        context['form']=form
        context['favorited']=favorited
        context['liked']=liked

        return context


class ProfileIndex(DetailView):
    template_name='post_art/profile_page.html'
    model=Profile
    pk_url_kwarg='profile_pk'
    context_object_name='profile'
    
    def get_context_data(self, **kwargs):
        context=super().get_context_data(**kwargs)
        profile=context.get('profile')
        published_posts=profile.postart_set.filter(published=True)
        context['posts']=published_posts

        if self.request.user.is_authenticated and profile==self.request.user.profile:
            context['is_profile_owner']=True
            context['drafts']=profile.postart_set.filter(published=False)
        return context

class ProfileUpdate(UpdateView):
    form_class=ProfileForm
    template_name='post_art/profile_update.html'  
    pk_url_kwarg='profile_pk'  
    queryset=Profile.objects.all()
    success_url='index'

    def dispatch(self, request, *args, **kwargs):
        obj=self.get_object()

        owned=owned_by_request(request,obj_profile=obj)
        if owned != True:
            return owned
        return super().dispatch(request, *args, **kwargs)
    
    def get_success_url(self):
        return reverse(self.success_url)
    
    def get_context_data(self, **kwargs):
        context= super().get_context_data(**kwargs)
        about=context.get('profile').about
        context['form_about']=AboutForm(instance=about)
        return context

def about_update(request,about_pk):
    if request.method=='POST':
        instance,_=get_object_or_none(About,id=about_pk)
        form=AboutForm(request.POST,instance=instance) 
        programs=request.POST.getlist('used_programs[]')

        if form.is_valid():
            form.save(used_programs=programs)
            return HttpResponseRedirect(reverse('index'))         

@method_decorator(login_required,name='dispatch')
class Logout(LogoutView):

    def post(self, request, *args, **kwargs):
        logout(request)

        return HttpResponseRedirect(reverse('index'))

class Login(LoginView):
    form_class=LoginForm
    template_name='post_art/login.html'

    def dispatch(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return HttpResponseRedirect(reverse('index'))
        return super().dispatch(request, *args, **kwargs)
    
    def form_valid(self, form):
        
        username=form.cleaned_data.get('username')
        password=form.cleaned_data.get('password')
        remember_me=form.cleaned_data.get('remember_me')

        user=authenticate(self.request,username=username,password=password)
        if user is not None:
            login(self.request, user)
            if remember_me:
                self.request.session.set_expiry(2592000)
            else:
                self.request.session.set_expiry(0)
            return HttpResponseRedirect(reverse('profile_index',kwargs={'profile_pk':user.profile.id}))
        return super().form_invalid(form=form)

class RegisterUser(FormView):
    form_class=UserForm
    template_name='post_art/register.html'
    
    def get_success_url(self):
        return reverse('index')

    def dispatch(self, request, *args, **kwargs):
            if self.request.user.is_authenticated:
                return HttpResponseRedirect(reverse('index'))
            return super().dispatch(request, *args, **kwargs)
    
    def form_valid(self, form):
        user=form.save()
        login(self.request,user=user)
        
        return super().form_valid(form)

