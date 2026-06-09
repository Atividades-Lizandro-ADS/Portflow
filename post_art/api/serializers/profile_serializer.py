from rest_framework import serializers
from ...models import Profile, Follow
from .about_serializer import AboutReadSerializer
from .commission_tier_serializer import CommissionTierSerializer


class ProfileMinimalSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user_profile.username', read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'first_name', 'username', 'user_picture', 'commissions_open')


class ProfileSerializer(serializers.ModelSerializer):
    about = AboutReadSerializer(read_only=True)
    username = serializers.CharField(source='user_profile.username', read_only=True)
    posts = serializers.SerializerMethodField()
    drafts = serializers.SerializerMethodField()
    liked_posts = serializers.SerializerMethodField()
    saved_posts = serializers.SerializerMethodField()
    followers_count = serializers.IntegerField(source='followers_set.count', read_only=True)
    following_count = serializers.IntegerField(source='following_set.count', read_only=True)
    is_following = serializers.SerializerMethodField()
    commission_tiers = CommissionTierSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = (
            'id', 'first_name', 'username', 'user_picture', 'profile_banner',
            'commissions_open', 'commission_tiers',
            'followers_count', 'following_count', 'is_following',
            'about', 'posts', 'drafts', 'liked_posts', 'saved_posts',
        )

    def _is_owner(self, obj):
        request = self.context.get('request')
        return bool(
            request and request.user.is_authenticated
            and obj.user_profile == request.user
        )

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Follow.objects.filter(follower=request.user.profile, following=obj).exists()

    def get_posts(self, obj):
        from .post_art_serializer import PostFeedSerializer
        qs = obj.postart_set.all()
        if not self._is_owner(obj):
            qs = qs.filter(published=True)
        return PostFeedSerializer(qs, many=True, context=self.context).data

    def get_drafts(self, obj):
        from .post_art_serializer import PostFeedSerializer
        if not self._is_owner(obj):
            return []
        qs = obj.postart_set.filter(published=False)
        return PostFeedSerializer(qs, many=True, context=self.context).data

    def get_liked_posts(self, obj):
        from .post_art_serializer import PostFeedSerializer
        from ...models import PostArt
        if not self._is_owner(obj):
            return []
        ids = obj.like_set.filter(like=True).values_list('like_post_id', flat=True)
        qs = PostArt.objects.filter(id__in=ids)
        return PostFeedSerializer(qs, many=True, context=self.context).data

    def get_saved_posts(self, obj):
        from .post_art_serializer import PostFeedSerializer
        if not self._is_owner(obj):
            return []
        return PostFeedSerializer(obj.saved_posts.all(), many=True, context=self.context).data


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('first_name', 'user_picture', 'profile_banner', 'commissions_open')
