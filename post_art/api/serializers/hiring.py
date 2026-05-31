from rest_framework import serializers
from ...models import Hiring


class HiringSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hiring
        fields = ('id', 'hire_type')
