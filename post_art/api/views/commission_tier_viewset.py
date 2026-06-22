from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated, AllowAny

from ..serializers import CommissionTierSerializer
from ...models import CommissionTier


class CommissionTierViewSet(viewsets.ModelViewSet):
    queryset = CommissionTier.objects.select_related('profile__user_profile')

    def get_serializer_class(self):
        return CommissionTierSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(profile=self.request.user.profile)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            if obj.profile != request.user.profile:
                raise exceptions.PermissionDenied('Você não pode editar este tier.')
