from rest_framework import serializers
from ...models import PostImages


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImages
        fields = ('id', 'post_img', 'acessibility_caption', 'caption', 'image_post_owner', 'cell_size_x', 'cell_size_y', 'is_mature')
        extra_kwargs = {
            'post_img': {'required': False},
            'image_post_owner': {'read_only': True},
        }

    def update(self, instance, validated_data):
        if 'post_img' not in validated_data:
            validated_data['post_img'] = instance.post_img
        return super().update(instance, validated_data)
