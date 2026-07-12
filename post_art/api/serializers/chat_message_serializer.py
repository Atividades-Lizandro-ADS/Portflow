from rest_framework import serializers

from ...models import ChatMessage
from .briefing_serializer import BriefingSerializer
from .chat_attachment_serializer import ChatAttachmentSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    attachments = ChatAttachmentSerializer(many=True, read_only=True)
    related_briefing_detail = BriefingSerializer(source='related_briefing', read_only=True)

    class Meta:
        model = ChatMessage
        fields = (
            'id', 'conversation', 'sender', 'body', 'message_type',
            'related_briefing', 'related_briefing_detail', 'related_extension_request',
            'is_read', 'created_at', 'attachments',
        )
        read_only_fields = (
            'id', 'sender', 'message_type', 'related_briefing', 'related_briefing_detail',
            'related_extension_request', 'is_read', 'created_at', 'attachments',
        )

    def validate(self, attrs):
        body = attrs.get('body', '')
        has_files = bool(self.context['request'].FILES.getlist('attachments[]'))
        if not body and not has_files:
            raise serializers.ValidationError('A mensagem precisa ter texto ou ao menos um anexo.')
        if not attrs['conversation'].can_send_messages():
            raise serializers.ValidationError('Este artista está com comissões fechadas no momento.')
        return attrs
