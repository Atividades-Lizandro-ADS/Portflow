from rest_framework import serializers

from ...models import DeliveryExtensionRequest


class DeliveryExtensionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryExtensionRequest
        fields = (
            'id', 'briefing', 'current_deadline', 'new_deadline',
            'reason', 'status', 'created_at', 'responded_at',
        )
        read_only_fields = ('id', 'current_deadline', 'status', 'created_at', 'responded_at')

    def validate(self, attrs):
        briefing = attrs['briefing']
        new_deadline = attrs.get('new_deadline')
        reference_deadline = briefing.deadline or briefing.requested_deadline
        if new_deadline <= reference_deadline:
            raise serializers.ValidationError('O novo prazo precisa ser posterior ao prazo atual.')
        return attrs
