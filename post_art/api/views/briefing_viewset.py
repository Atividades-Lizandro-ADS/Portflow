from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, exceptions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..serializers import BriefingSerializer
from ...models import Briefing, BriefingAttachment


class BriefingViewSet(viewsets.ModelViewSet):
    serializer_class = BriefingSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        profile = self.request.user.profile
        return Briefing.objects.filter(
            Q(conversation__client=profile) | Q(conversation__artist=profile)
        ).select_related('conversation', 'tier').prefetch_related('attachments')

    def perform_create(self, serializer):
        conversation = serializer.validated_data['conversation']
        profile = self.request.user.profile
        if profile != conversation.client:
            raise exceptions.PermissionDenied('Só o cliente pode enviar um briefing.')

        tier = conversation.tier
        briefing = serializer.save(
            tier=tier,
            tier_name_snapshot=tier.name,
            tier_price_snapshot=tier.price,
        )
        for f in self.request.FILES.getlist('references[]'):
            BriefingAttachment.objects.create(
                briefing=briefing,
                file=f,
                original_filename=f.name,
                file_size=f.size,
            )

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if self.action in ('accept', 'decline') and obj.conversation.artist != request.user.profile:
            raise exceptions.PermissionDenied('Só o artista pode responder a este briefing.')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        briefing = self.get_object()
        if briefing.status != 'pending':
            raise exceptions.ValidationError('Este briefing já foi respondido.')
        deadline = request.data.get('deadline', briefing.requested_deadline)
        briefing.status = 'accepted'
        briefing.deadline = deadline
        briefing.responded_at = timezone.now()
        briefing.save(update_fields=['status', 'deadline', 'responded_at'])
        return Response(self.get_serializer(briefing).data)

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        briefing = self.get_object()
        if briefing.status != 'pending':
            raise exceptions.ValidationError('Este briefing já foi respondido.')
        briefing.status = 'declined'
        briefing.decline_reason = request.data.get('decline_reason', '')
        briefing.responded_at = timezone.now()
        briefing.save(update_fields=['status', 'decline_reason', 'responded_at'])
        return Response(self.get_serializer(briefing).data)
