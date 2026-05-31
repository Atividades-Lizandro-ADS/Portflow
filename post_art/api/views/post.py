from django.db.models import Q
from rest_framework import generics, exceptions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ..custom_paginators import PaginationCustom
from ..serializers import (
    PostFeedSerializer, PostDetailSerializer, PostWriteSerializer, PostArtRefreshSerializer,
)
from ...models import PostArt, PostImages, UsedPrograms


class PostListCreateView(generics.ListCreateAPIView):
    pagination_class = PaginationCustom

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostWriteSerializer
        return PostFeedSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        qs = PostArt.objects.filter(published=True)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(tittle__icontains=search) |
                Q(caption__icontains=search) |
                Q(description__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        post = serializer.save(post_owner=self.request.user.profile)
        self._save_images(post)
        self._save_programs(post)

    def _save_images(self, post):
        files = self.request.FILES.getlist('post_img[]')
        captions = self.request.data.getlist('caption[]')
        accessibility = self.request.data.getlist('acessibility_caption[]')
        for i, f in enumerate(files):
            PostImages.objects.create(
                image_post_owner=post,
                post_img=f,
                caption=captions[i] if i < len(captions) else '',
                acessibility_caption=accessibility[i] if i < len(accessibility) else '',
            )

    def _save_programs(self, post):
        program_ids = self.request.data.getlist('used_programs[]')
        if program_ids:
            post.used_programs.set(UsedPrograms.objects.filter(id__in=program_ids))


class PostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PostArt.objects.all()
    lookup_url_kwarg = 'post_pk'

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return PostWriteSerializer
        return PostDetailSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [IsAuthenticated()]
        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increase_view()
        return Response(self.get_serializer(instance).data)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ('PUT', 'PATCH', 'DELETE'):
            if obj.post_owner != request.user.profile:
                raise exceptions.PermissionDenied('Você não tem permissão para modificar este post.')

    def perform_update(self, serializer):
        post = serializer.save()
        files = self.request.FILES.getlist('post_img[]')
        if files:
            captions = self.request.data.getlist('caption[]')
            accessibility = self.request.data.getlist('acessibility_caption[]')
            for i, f in enumerate(files):
                PostImages.objects.create(
                    image_post_owner=post,
                    post_img=f,
                    caption=captions[i] if i < len(captions) else '',
                    acessibility_caption=accessibility[i] if i < len(accessibility) else '',
                )
        program_ids = self.request.data.getlist('used_programs[]')
        if program_ids:
            post.used_programs.set(UsedPrograms.objects.filter(id__in=program_ids))


class PostsArtViewRefresh(generics.ListAPIView):
    queryset = PostArt.objects.filter(published=True)
    serializer_class = PostArtRefreshSerializer
    pagination_class = PaginationCustom
    permission_classes = [AllowAny]
