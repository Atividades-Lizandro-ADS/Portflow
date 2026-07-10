from rest_framework import serializers

from ...models import ChatAttachment


class ChatAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatAttachment
        fields = ('id', 'message', 'file', 'original_filename', 'file_size')
        read_only_fields = ('id', 'message', 'original_filename', 'file_size')
