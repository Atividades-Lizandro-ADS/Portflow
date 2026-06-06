from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from ..serializers import SkillSerializer
from ...models import Skill


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    queryset = Skill.objects.all()
