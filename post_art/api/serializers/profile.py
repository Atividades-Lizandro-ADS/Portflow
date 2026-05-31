from rest_framework import serializers
from ...models import Profile
from .about import AboutReadSerializer


class ProfileMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'first_name', 'user_picture')


class ProfileSerializer(serializers.ModelSerializer):
    about = AboutReadSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ('id', 'first_name', 'user_picture', 'profile_banner', 'about')


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('first_name', 'user_picture', 'profile_banner')
