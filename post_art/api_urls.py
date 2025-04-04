from django.urls import path
from .rest_views import PostArtView,PostsArtView,PostArtViewset,PostsArtViewRefresh,add_comment,add_like,delete_comment,delete_post_image,update_postArt_Image,UsedProgramsView

from rest_framework.routers import SimpleRouter
router=SimpleRouter()

router.register('postart',PostArtViewset)

urlpatterns = [
    path('used_programs/',UsedProgramsView.as_view(),name='used_programs'),
    path('posts/',PostsArtView.as_view(),name='posts'),
    path('posts/refresh',PostsArtViewRefresh.as_view(),name='post_refresh'),
    path('posts/<int:pk>',PostArtView.as_view(),name='post'),
    path('posts/comment',add_comment.as_view(),name='add_comment'),
    path('posts/comment/delete/<int:comment_pk>',delete_comment.as_view(),name='delete_comment'),
    path('postagem/update/post_image/delete/<int:post_image_pk>',delete_post_image.as_view(),name='delete_post_image'),
    path('postagem/update/post_image/<int:post_img_pk>',update_postArt_Image.as_view(),name='post_image_update'),
    path('posts/like',add_like.as_view(),name='add_like'),
]

