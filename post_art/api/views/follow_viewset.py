from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated, AllowAny

from ..serializers import FollowSerializer
from ...models import Follow


class FollowViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'delete', 'head', 'options']
    queryset = Follow.objects.select_related(
        'follower__user_profile',
        'following__user_profile',
    )

    def get_serializer_class(self):
        return FollowSerializer

    def get_permissions(self):
        if self.action in ('create', 'destroy'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(follower=self.request.user.profile)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method == 'DELETE':
            if obj.follower != request.user.profile:
                raise exceptions.PermissionDenied('Você não pode desfazer o follow de outra pessoa.')
