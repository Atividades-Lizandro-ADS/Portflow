from django.urls import path
from .views import Index,postPost,update_postArt,post_details,profile_index,add_favorite,Logout,Login,RegisterUser,ProfileUpdate


urlpatterns = [
    path('',Index.as_view(),name='index'),
    path('postagem/',postPost.as_view(),name='postPost'),
    path('postagem/update/<int:post_pk>',update_postArt.as_view(),name='post_update'),
    path('post/<int:post_pk>',post_details.as_view(),name='post_details'),
    path('profile/<int:profile_pk>',profile_index.as_view(),name='profile_index'),
    path('profile/update/<int:profile_pk>',ProfileUpdate.as_view(),name='profile_update'),
    path('profile/save_favorite',add_favorite.as_view(),name='save_favorite'),
    path('authentication/register',RegisterUser.as_view(),name='register'),
    path('authentication/login',Login.as_view(),name='login'),
    path('authentication/logout',Logout.as_view(),name='logout'),
]