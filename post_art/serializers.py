from rest_framework import serializers
from .models import PostArt

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