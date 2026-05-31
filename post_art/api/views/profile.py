from rest_framework import viewsets, exceptions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ..serializers import ProfileSerializer, ProfileUpdateSerializer, PostFeedSerializer
from ...models import Profile


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_permissions(self):
        if self.action in ('update', 'partial_update'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            if obj != request.user.profile:
                raise exceptions.PermissionDenied('Você não pode editar este perfil.')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        is_owner = request.user.is_authenticated and instance == request.user.profile
        ctx = self.get_serializer_context()

        data['posts'] = PostFeedSerializer(
            instance.postart_set.filter(published=True), many=True, context=ctx
        ).data
        data['is_owner'] = is_owner

        if is_owner:
            data['drafts'] = PostFeedSerializer(
                instance.postart_set.filter(published=False), many=True, context=ctx
            ).data

        return Response(data)
