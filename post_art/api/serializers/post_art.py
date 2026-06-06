from rest_framework import serializers
from ...models import PostArt, Like
from .profile import ProfileMinimalSerializer
from .used_programs import UsedProgramsSerializer
from .post_images import PostImageSerializer


class PostArtSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostArt
        fields = ('id', 'tittle', 'description')


class PostArtRefreshSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostArt
        fields = ('id', 'tittle', 'post_thumb')


class PostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostArt
        fields = (
            'tittle', 'caption', 'description', 'art_type', 'category',
            'post_thumb', 'youtube_link', 'sketchfab_link', 'marmoview',
            'keywords', 'published', 'display_type',
        )


class PostFeedSerializer(serializers.ModelSerializer):
    post_owner = ProfileMinimalSerializer(read_only=True)
    like_num = serializers.SerializerMethodField()
    view_number = serializers.SerializerMethodField()

    class Meta:
        model = PostArt
        fields = (
            'id', 'tittle', 'caption', 'post_thumb',
            'art_type', 'post_owner', 'like_num', 'view_number', 'creation_date',
        )

    def get_like_num(self, obj):
        return obj.like_num

    def get_view_number(self, obj):
        return obj.view_number


class PostDetailSerializer(serializers.ModelSerializer):
    post_owner = ProfileMinimalSerializer(read_only=True)
    images = serializers.SerializerMethodField()
    used_programs = UsedProgramsSerializer(many=True, read_only=True)
    like_num = serializers.SerializerMethodField()
    view_number = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()
    favorited = serializers.SerializerMethodField()
    keywords_list = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = PostArt
        fields = (
            'id', 'tittle', 'caption', 'description', 'art_type', 'category',
            'post_thumb', 'post_owner', 'images', 'used_programs', 'display_type',
            'like_num', 'view_number', 'liked', 'favorited',
            'youtube_link', 'sketchfab_link', 'marmoview', 'keywords', 'keywords_list',
            'published', 'creation_date', 'comments_count',
        )

    def get_images(self, obj):
        return PostImageSerializer(obj.postimages_set.all(), many=True, context=self.context).data

    def get_like_num(self, obj):
        return obj.like_num

    def get_view_number(self, obj):
        return obj.view_number

    def get_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                like_owner=request.user.profile, like_post=obj, like=True
            ).exists()
        return False

    def get_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user.profile.saved_posts.filter(id=obj.id).exists()
        return False

    def get_keywords_list(self, obj):
        if not obj.keywords:
            return []
        return [k for k in obj.keywords.split('#') if k.strip()]

    def get_comments_count(self, obj):
        return obj.comments_set.count()
