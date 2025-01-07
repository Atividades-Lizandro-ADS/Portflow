from django.urls import path
from .views import Index,postPost,post_details


urlpatterns = [
    path('',Index,name='index'),
    path('postagem/',postPost,name='postPost'),
    path('postagem/<int:post_pk>',post_details,name='post_details'),
]