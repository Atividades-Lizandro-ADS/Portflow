from django.db.models import Max, Q
from django.db.models.functions import Coalesce
from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..serializers import ConversationSerializer
from ...models import Conversation


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        profile = self.request.user.profile
        return Conversation.objects.filter(
            Q(client=profile) | Q(artist=profile)
        ).select_related(
            'tier', 'client__user_profile', 'artist__user_profile'
        ).annotate(
            last_activity=Coalesce(Max('messages__created_at'), 'created_at')
        ).order_by('-last_activity')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tier = serializer.validated_data['tier']

        if tier.profile == request.user.profile:
            raise exceptions.ValidationError('Você não pode iniciar uma conversa com você mesmo.')

        if not tier.is_active:
            raise exceptions.ValidationError('Este tier não está mais disponível.')

        if not tier.profile.commissions_open:
            raise exceptions.ValidationError('Este artista não está com comissões abertas no momento.')

        conversation, _ = Conversation.objects.get_or_create(
            client=request.user.profile,
            artist=tier.profile,
            tier=tier,
        )
        return Response(self.get_serializer(conversation).data)
