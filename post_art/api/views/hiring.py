from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from ..serializers import HiringSerializer
from ...models import Hiring


class HiringViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HiringSerializer
    permission_classes = [AllowAny]
    queryset = Hiring.objects.all()
