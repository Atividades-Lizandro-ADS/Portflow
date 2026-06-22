from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..serializers.notification_serializer import NotificationSerializer
from ...models import Notification


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return (
            Notification.objects
            .filter(recipient=self.request.user.profile)
            .select_related('template', 'actor__user_profile', 'target_post')
        )

    def partial_update(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = request.data.get('is_read', True)
        notification.save(update_fields=['is_read'])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        count = (
            Notification.objects
            .filter(recipient=request.user.profile, is_read=False)
            .update(is_read=True)
        )
        return Response({'marked_read': count})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = (
            Notification.objects
            .filter(recipient=request.user.profile, is_read=False)
            .count()
        )
        return Response({'count': count})
