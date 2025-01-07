from django.urls import path
from .views import PostArtView,PostsArtView,PostArtViewset

from rest_framework.routers import SimpleRouter
router=SimpleRouter()
router.register('postart',PostArtViewset)

urlpatterns = [
    path('posts/',PostsArtView.as_view(),name='posts'),
    path('posts/<int:pk>',PostArtView.as_view(),name='post'),
]