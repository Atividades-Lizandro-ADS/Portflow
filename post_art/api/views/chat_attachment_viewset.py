from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from ..serializers import ChatAttachmentSerializer
from ...models import ChatAttachment


class ChatAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = ChatAttachmentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):
        profile = self.request.user.profile
        return ChatAttachment.objects.filter(
            Q(message__conversation__client=profile) | Q(message__conversation__artist=profile)
        )
