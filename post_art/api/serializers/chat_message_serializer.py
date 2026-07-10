from rest_framework import serializers

from ...models import ChatMessage
from .chat_attachment_serializer import ChatAttachmentSerializer


class ChatMessageSerializer(serializers.ModelSerializer):
    attachments = ChatAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ChatMessage
        fields = (
            'id', 'conversation', 'sender', 'body', 'message_type',
            'related_briefing', 'related_extension_request',
            'is_read', 'created_at', 'attachments',
        )
        read_only_fields = (
            'id', 'sender', 'message_type', 'related_briefing',
            'related_extension_request', 'is_read', 'created_at', 'attachments',
        )

    def validate(self, attrs):
        body = attrs.get('body', '')
        has_files = bool(self.context['request'].FILES.getlist('attachments[]'))
        if not body and not has_files:
            raise serializers.ValidationError('A mensagem precisa ter texto ou ao menos um anexo.')
        return attrs
