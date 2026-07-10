from rest_framework import serializers

from ...models import BriefingAttachment


class BriefingAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BriefingAttachment
        fields = ('id', 'briefing', 'file', 'original_filename', 'file_size')
        read_only_fields = ('id', 'briefing', 'original_filename', 'file_size')
