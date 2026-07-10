from rest_framework import serializers

from ...models import Conversation


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ('id', 'tier', 'client', 'artist', 'created_at')
        read_only_fields = ('id', 'client', 'artist', 'created_at')
