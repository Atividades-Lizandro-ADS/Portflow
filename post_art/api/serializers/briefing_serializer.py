from django.utils import timezone
from rest_framework import serializers

from ...models import Briefing
from .briefing_attachment_serializer import BriefingAttachmentSerializer


class BriefingSerializer(serializers.ModelSerializer):
    attachments = BriefingAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Briefing
        fields = (
            'id', 'conversation', 'tier', 'tier_name_snapshot', 'tier_price_snapshot',
            'agreed_price', 'request_details', 'status', 'requested_deadline',
            'deadline', 'decline_reason', 'created_at', 'responded_at', 'attachments',
        )
        read_only_fields = (
            'id', 'tier', 'tier_name_snapshot', 'tier_price_snapshot', 'status',
            'deadline', 'decline_reason', 'created_at', 'responded_at', 'attachments',
        )

    def validate(self, attrs):
        conversation = attrs['conversation']
        tier = conversation.tier
        agreed_price = attrs.get('agreed_price')

        if conversation.briefings.filter(status='pending').exists():
            raise serializers.ValidationError('Já existe um briefing pendente nesta conversa.')

        if not tier.negotiable and agreed_price != tier.price:
            raise serializers.ValidationError('Esta tier não é negociável; o valor precisa ser igual ao preço da tier.')
        if tier.negotiable:
            if tier.negotiation_direction == 'up' and agreed_price < tier.price:
                raise serializers.ValidationError('Esta tier só pode ser negociada para mais.')
            if tier.negotiation_direction == 'down' and agreed_price > tier.price:
                raise serializers.ValidationError('Esta tier só pode ser negociada para menos.')

        requested_deadline = attrs.get('requested_deadline')
        if requested_deadline and requested_deadline < timezone.now().date():
            raise serializers.ValidationError('O prazo solicitado precisa ser uma data futura.')

        return attrs
