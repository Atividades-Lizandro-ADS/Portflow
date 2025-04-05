from django.urls import path
from .views import Index,postPost,update_postArt,post_details,profile_index,add_favorite


urlpatterns = [
    path('',Index.as_view(),name='index'),
    path('postagem/',postPost.as_view(),name='postPost'),
    path('postagem/update/<int:post_pk>',update_postArt.as_view(),name='post_update'),
    path('post/<int:post_pk>',post_details.as_view(),name='post_details'),
    path('profile/<int:profile_pk>',profile_index.as_view(),name='profile_index'),
    path('profile/save_favorite',add_favorite.as_view(),name='save_favorite'),
]