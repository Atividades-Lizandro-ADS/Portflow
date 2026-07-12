from rest_framework import serializers

from ...models import Conversation


class ConversationSerializer(serializers.ModelSerializer):
    tier_detail = serializers.SerializerMethodField()
    other_profile = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    can_send_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            'id', 'tier', 'tier_detail', 'client', 'artist',
            'other_profile', 'last_message', 'can_send_message', 'created_at',
        )
        read_only_fields = ('id', 'client', 'artist', 'created_at')

    def get_tier_detail(self, obj):
        from .commission_tier_serializer import CommissionTierSerializer
        return CommissionTierSerializer(obj.tier).data

    def get_other_profile(self, obj):
        from .profile_serializer import ProfileMinimalSerializer
        request = self.context.get('request')
        me = request.user.profile if request and request.user.is_authenticated else None
        other = obj.artist if me == obj.client else obj.client
        return ProfileMinimalSerializer(other).data

    def get_can_send_message(self, obj):
        return obj.can_send_messages()

    def get_last_message(self, obj):
        message = obj.messages.order_by('-created_at').first()
        if not message:
            return None
        return {
            'body': message.body,
            'message_type': message.message_type,
            'sender': message.sender_id,
            'created_at': message.created_at,
        }
