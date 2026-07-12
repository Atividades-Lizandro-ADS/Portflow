from django.db.models import Q
from rest_framework import viewsets, exceptions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..serializers import ChatMessageSerializer
from ...models import ChatMessage, ChatAttachment


PAGE_SIZE = 100


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        profile = self.request.user.profile
        qs = ChatMessage.objects.filter(
            Q(conversation__client=profile) | Q(conversation__artist=profile)
        ).select_related('sender__user_profile', 'conversation').prefetch_related('attachments')
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            qs = qs.filter(conversation_id=conversation_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset().order_by('-pk')
        before = request.query_params.get('before')
        if before:
            queryset = queryset.filter(pk__lt=before)

        page = list(queryset[:PAGE_SIZE + 1])
        has_more = len(page) > PAGE_SIZE
        page = page[:PAGE_SIZE]
        page.reverse()

        serializer = self.get_serializer(page, many=True)
        return Response({'results': serializer.data, 'has_more': has_more})

    def perform_create(self, serializer):
        conversation = serializer.validated_data['conversation']
        profile = self.request.user.profile
        if profile not in (conversation.client, conversation.artist):
            raise exceptions.PermissionDenied('Você não participa desta conversa.')

        message = serializer.save(sender=profile)
        for f in self.request.FILES.getlist('attachments[]'):
            ChatAttachment.objects.create(
                message=message,
                file=f,
                original_filename=f.name,
                file_size=f.size,
            )

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        if message.sender == request.user.profile:
            raise exceptions.PermissionDenied('Você não pode marcar sua própria mensagem como lida.')
        message.is_read = True
        message.save(update_fields=['is_read'])
        return Response({'is_read': True})
