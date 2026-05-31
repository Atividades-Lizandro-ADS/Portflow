from rest_framework import serializers
from ...models import Comments


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comments
        fields = ('id', 'comment_owner', 'comment_post', 'comment_text', 'created')
