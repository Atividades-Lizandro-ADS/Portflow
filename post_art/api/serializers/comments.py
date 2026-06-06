from rest_framework import serializers
from ...models import Comments
from .profile import ProfileMinimalSerializer


class CommentSerializer(serializers.ModelSerializer):
    comment_owner = ProfileMinimalSerializer(read_only=True)

    class Meta:
        model = Comments
        fields = ('id', 'comment_owner', 'comment_post', 'comment_text', 'created')
