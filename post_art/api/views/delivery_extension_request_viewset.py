from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, exceptions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..serializers import DeliveryExtensionRequestSerializer
from ...models import DeliveryExtensionRequest


class DeliveryExtensionRequestViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryExtensionRequestSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        profile = self.request.user.profile
        return DeliveryExtensionRequest.objects.filter(
            Q(briefing__conversation__client=profile) | Q(briefing__conversation__artist=profile)
        ).select_related('briefing__conversation')

    def perform_create(self, serializer):
        briefing = serializer.validated_data['briefing']
        profile = self.request.user.profile
        if profile != briefing.conversation.artist:
            raise exceptions.PermissionDenied('Só o artista pode pedir uma extensão de prazo.')
        if briefing.status != 'accepted':
            raise exceptions.ValidationError('Só é possível pedir extensão em briefings aceitos.')
        serializer.save(current_deadline=briefing.deadline)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if self.action in ('accept', 'decline') and obj.briefing.conversation.client != request.user.profile:
            raise exceptions.PermissionDenied('Só o cliente pode responder a este pedido de extensão.')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        extension = self.get_object()
        if extension.status != 'pending':
            raise exceptions.ValidationError('Este pedido já foi respondido.')
        extension.status = 'accepted'
        extension.responded_at = timezone.now()
        extension.save(update_fields=['status', 'responded_at'])
        briefing = extension.briefing
        briefing.deadline = extension.new_deadline
        briefing.save(update_fields=['deadline'])
        return Response(self.get_serializer(extension).data)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        extension = self.get_object()
        if extension.status != 'pending':
            raise exceptions.ValidationError('Este pedido já foi respondido.')
        extension.status = 'declined'
        extension.responded_at = timezone.now()
        extension.save(update_fields=['status', 'responded_at'])
        return Response(self.get_serializer(extension).data)
