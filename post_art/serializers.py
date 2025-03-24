from rest_framework import serializers
from .models import PostArt,Comments,Like

class PostArtSerializers(serializers.ModelSerializer):
    class Meta:
        model=PostArt
        fields=(
            'id',
            'tittle',
            'description',
        )

        def validate_tittle(self,valor):
            if valor=="":
                raise serializers.ValidationError("o titulo não deve ser vázio")
            return valor
        
class PostArtSerializerRefresh(serializers.ModelSerializer):
    class Meta:
        model=PostArt
        fields=(
            'id',
            'tittle',
            'post_thumb',
        )

        def validate_tittle(self,valor):
            if valor=="":
                raise serializers.ValidationError("o titulo não deve ser vázio")
            return valor
        
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Comments
        fields=(
                'id',
               'comment_owner',
               'comment_post',
               'comment_text'
               )
        
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model=Like
        fields=(
                'id',
               'like_owner',
               'like_post',
               'like'
               )