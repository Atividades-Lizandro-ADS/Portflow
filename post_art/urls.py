from django.urls import path
from .views import Index,AboutUpdate,CreatePostArt,UpdatePostArt,PostDetails,ProfileIndex,Logout,Login,RegisterUser,ProfileUpdate


urlpatterns = [
    path('',Index.as_view(),name='index'),
    path('postagem/',CreatePostArt.as_view(),name='postPost'),
    path('postagem/update/<int:post_pk>',UpdatePostArt.as_view(),name='post_update'),
    path('post/<int:post_pk>',PostDetails.as_view(),name='post_details'),
    path('profile/<int:profile_pk>',ProfileIndex.as_view(),name='profile_index'),
    path('profile/update/<int:profile_pk>',ProfileUpdate.as_view(),name='profile_update'),
    path('profile/about/update/',AboutUpdate.as_view(),name='about_update'),
    path('authentication/register',RegisterUser.as_view(),name='register'),
    path('authentication/login',Login.as_view(),name='login'),
    path('authentication/logout',Logout.as_view(),name='logout'),
]