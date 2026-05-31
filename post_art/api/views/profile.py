from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ..serializers import (
    ProfileSerializer, ProfileUpdateSerializer,
    AboutWriteSerializer, PostFeedSerializer,
)
from ...models import Profile, About


class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    lookup_url_kwarg = 'profile_pk'

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProfileUpdateSerializer
        return ProfileSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PUT', 'PATCH'):
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


class AboutUpdateView(generics.UpdateAPIView):
    serializer_class = AboutWriteSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        about, _ = About.objects.get_or_create(prof=self.request.user.profile)
        return about
