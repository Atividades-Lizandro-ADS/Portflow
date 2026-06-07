from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=70)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if ' ' in value:
            raise serializers.ValidationError('Username não pode conter espaços. Use _ para separar palavras.')
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Este username já está em uso.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este e-mail já está cadastrado.')
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'As senhas não coincidem.'})
        return data

    def save(self):
        data = self.validated_data
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
        )
        user.profile.first_name = data['first_name']
        user.profile.save()
        return user
