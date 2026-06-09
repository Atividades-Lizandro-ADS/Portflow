from rest_framework import serializers
from ...models import Follow, Profile


class FollowSerializer(serializers.ModelSerializer):
    follower_username = serializers.CharField(source='follower.user_profile.username', read_only=True)
    following_username = serializers.CharField(source='following.user_profile.username', read_only=True)

    class Meta:
        model = Follow
        fields = ('id', 'follower', 'follower_username', 'following', 'following_username', 'created_at')
        read_only_fields = ('id', 'follower', 'follower_username', 'following_username', 'created_at')

    def validate_following(self, value):
        request = self.context.get('request')
        if request and hasattr(request.user, 'profile') and value == request.user.profile:
            raise serializers.ValidationError('Você não pode seguir a si mesmo.')
        return value
