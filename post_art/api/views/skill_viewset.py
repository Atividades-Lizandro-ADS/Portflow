from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from ..serializers import SkillSerializer
from ...models import Skill


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    queryset = Skill.objects.all()
    http_method_names = ['get', 'head', 'options']
