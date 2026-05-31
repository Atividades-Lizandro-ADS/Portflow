from rest_framework import serializers
from ...models import About, Hiring, Skill, UsedPrograms
from .hiring import HiringSerializer
from .skill import SkillSerializer
from .used_programs import UsedProgramsSerializer


class AboutReadSerializer(serializers.ModelSerializer):
    hiring = HiringSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    programs_known = UsedProgramsSerializer(many=True, read_only=True)

    class Meta:
        model = About
        fields = ('summary', 'hiring', 'skills', 'programs_known')


class AboutWriteSerializer(serializers.ModelSerializer):
    hiring = serializers.PrimaryKeyRelatedField(queryset=Hiring.objects.all(), many=True)
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True)
    programs_known = serializers.PrimaryKeyRelatedField(queryset=UsedPrograms.objects.all(), many=True)

    class Meta:
        model = About
        fields = ('summary', 'hiring', 'skills', 'programs_known')

    def update(self, instance, validated_data):
        hiring = validated_data.pop('hiring', None)
        skills = validated_data.pop('skills', None)
        programs_known = validated_data.pop('programs_known', None)
        instance = super().update(instance, validated_data)
        if hiring is not None:
            instance.hiring.set(hiring)
        if skills is not None:
            instance.skills.set(skills)
        if programs_known is not None:
            instance.programs_known.set(programs_known)
        return instance
