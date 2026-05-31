from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, LogoutView,
    PostArtViewSet, ProfileViewSet, AboutViewSet,
    CommentViewSet, PostImageViewSet, UsedProgramsViewSet,
)

router = DefaultRouter()
router.register('posts', PostArtViewSet, basename='post')
router.register('profiles', ProfileViewSet, basename='profile')
router.register('about', AboutViewSet, basename='about')
router.register('comments', CommentViewSet, basename='comment')
router.register('post-images', PostImageViewSet, basename='post-image')
router.register('programs', UsedProgramsViewSet, basename='program')

urlpatterns = router.urls + [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
]
