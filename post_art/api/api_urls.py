from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, LogoutView, CheckUsernameView, MeView,
    PostArtViewSet, ProfileViewSet, AboutViewSet,
    CommentViewSet, PostImageViewSet, UsedProgramsViewSet,
    HiringViewSet, SkillViewSet, NotificationViewSet, NotificationStreamView,
    CommissionTierViewSet, FollowViewSet,
    ConversationViewSet, ChatMessageViewSet, ChatAttachmentViewSet,
    BriefingViewSet, DeliveryExtensionRequestViewSet,
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
router.register('notifications', NotificationViewSet, basename='notification')
router.register('commission-tiers', CommissionTierViewSet, basename='commission-tier')
router.register('follows', FollowViewSet, basename='follow')
router.register('conversations', ConversationViewSet, basename='conversation')
router.register('chat-messages', ChatMessageViewSet, basename='chat-message')
router.register('chat-attachments', ChatAttachmentViewSet, basename='chat-attachment')
router.register('briefings', BriefingViewSet, basename='briefing')
router.register('extension-requests', DeliveryExtensionRequestViewSet, basename='extension-request')

urlpatterns = router.urls + [
    path('notif-stream/', NotificationStreamView.as_view(), name='notification_stream'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/check-username/', CheckUsernameView.as_view(), name='auth_check_username'),
    path('auth/me/', MeView.as_view(), name='auth_me'),
]
