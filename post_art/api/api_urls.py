from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, LogoutView,
    PostListCreateView, PostRetrieveUpdateDestroyView, PostsArtViewRefresh,
    ProfileView, AboutUpdateView,
    CommentCreateView, CommentDestroyView, LikeView, FavoriteView,
    PostImageView,
    UsedProgramsView, RemoveUsedPrograms, RemoveUsedProgramsAbout,
)

router = DefaultRouter()
router.register('posts/like', LikeView, basename='like')

urlpatterns = router.urls + [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),

    # Posts
    path('posts/', PostListCreateView.as_view(), name='posts'),
    path('posts/<int:post_pk>/', PostRetrieveUpdateDestroyView.as_view(), name='post'),
    path('posts/refresh/', PostsArtViewRefresh.as_view(), name='post_refresh'),
    path('posts/comment/', CommentCreateView.as_view(), name='add_comment'),
    path('posts/comment/<int:comment_pk>/', CommentDestroyView.as_view(), name='delete_comment'),

    # Profile
    path('profile/<int:profile_pk>/', ProfileView.as_view(), name='profile'),
    path('about/', AboutUpdateView.as_view(), name='about_update'),
    path('profile/save_favorite/<int:post_pk>/', FavoriteView.as_view(), name='save_favorite'),

    # Imagens
    path('posts/images/<int:post_img_pk>/', PostImageView.as_view(), name='post_image_update'),

    # Programas
    path('programs/', UsedProgramsView.as_view(), name='used_programs'),
    path('programs/post/<int:post_pk>/remove/<int:program_pk>/', RemoveUsedPrograms.as_view(), name='remove_used_programs'),
    path('programs/about/<int:post_pk>/remove/<int:program_pk>/', RemoveUsedProgramsAbout.as_view(), name='remove_used_programs_about'),
]
