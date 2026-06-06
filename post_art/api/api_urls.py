from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, LogoutView, CheckUsernameView, MeView,
    PostArtViewSet, ProfileViewSet, AboutViewSet,
    CommentViewSet, PostImageViewSet, UsedProgramsViewSet,
    HiringViewSet, SkillViewSet,
)

router = DefaultRouter()
router.register('posts', PostArtViewSet, basename='post')
router.register('profiles', ProfileViewSet, basename='profile')
router.register('about', AboutViewSet, basename='about')
router.register('comments', CommentViewSet, basename='comment')
router.register('post-images', PostImageViewSet, basename='post-image')
router.register('programs', UsedProgramsViewSet, basename='program')
router.register('hiring', HiringViewSet, basename='hiring')
router.register('skills', SkillViewSet, basename='skill')

urlpatterns = router.urls + [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/check-username/', CheckUsernameView.as_view(), name='auth_check_username'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
]
