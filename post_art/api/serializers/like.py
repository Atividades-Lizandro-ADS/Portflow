from rest_framework import serializers
from ...models import Like


class LikeSerializer(serializers.ModelSerializer):
    like_post = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Like
        fields = ('id', 'like_post', 'like')
