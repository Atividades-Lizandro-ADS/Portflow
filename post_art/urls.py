from django.urls import path
from .views import Index,postPost,post_details,profile_index,add_favorite


urlpatterns = [
    path('',Index.as_view(),name='index'),
    path('postagem/',postPost,name='postPost'),
    path('post/<int:post_pk>',post_details,name='post_details'),
    path('profile/<int:profile_pk>',profile_index,name='profile_index'),
    path('profile/save_favorite',add_favorite.as_view(),name='save_favorite'),
]