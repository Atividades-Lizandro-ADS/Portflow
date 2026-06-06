from rest_framework import viewsets, exceptions, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ..serializers import ProfileSerializer, ProfileMinimalSerializer, ProfileUpdateSerializer, PostFeedSerializer
from ..custom_paginators import ProfilePaginationCustom
from ...models import Profile, PostArt


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.select_related('user_profile').all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'user__username']

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return ProfileUpdateSerializer
        if self.action == 'list':
            return ProfileMinimalSerializer
        return ProfileSerializer

    def get_paginator(self):
        if self.action == 'list':
            return ProfilePaginationCustom()
        return super().get_paginator()

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
            liked_ids = instance.like_set.filter(like=True).values_list('like_post_id', flat=True)
            data['liked_posts'] = PostFeedSerializer(
                PostArt.objects.filter(id__in=liked_ids), many=True, context=ctx
            ).data
            data['saved_posts'] = PostFeedSerializer(
                instance.saved_posts.all(), many=True, context=ctx
            ).data

        return Response(data)
