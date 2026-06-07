from rest_framework import serializers
from ...models import UsedPrograms


class UsedProgramsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsedPrograms
        fields = ('id', 'program_name', 'program_logo')
