from django.urls import path
from .rest_views import PostArtView,PostsArtView,PostArtViewset,PostsArtViewRefresh,add_comment

from rest_framework.routers import SimpleRouter
router=SimpleRouter()

router.register('postart',PostArtViewset)

urlpatterns = [
    path('posts/',PostsArtView.as_view(),name='posts'),
    path('posts/refresh',PostsArtViewRefresh.as_view(),name='post_refresh'),
    path('posts/<int:pk>',PostArtView.as_view(),name='post'),
    path('posts/comment',add_comment.as_view(),name='add_comment')
]