from django.db.models import Q
from rest_framework import viewsets, exceptions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ..custom_paginators import PaginationCustom
from ..serializers import PostFeedSerializer, PostDetailSerializer, PostWriteSerializer
from ...models import PostArt, PostImages, UsedPrograms, Like



class PostArtViewSet(viewsets.ModelViewSet):
    pagination_class = PaginationCustom

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return PostWriteSerializer
        if self.action == 'list':
            return PostFeedSerializer
        return PostDetailSerializer

    def get_permissions(self):
        public = ('list', 'retrieve')
        if self.action in public:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.action == 'retrieve':
            return PostArt.objects.all()
        qs = PostArt.objects.filter(published=True)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(tittle__icontains=search) |
                Q(caption__icontains=search) |
                Q(description__icontains=search)
            )
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.published:
            is_owner = request.user.is_authenticated and instance.post_owner == request.user.profile
            if not is_owner:
                raise exceptions.NotFound()
        instance.increase_view()
        return Response(self.get_serializer(instance).data)

    def perform_create(self, serializer):
        post = serializer.save(post_owner=self.request.user.profile)
        self._save_images(post)
        self._save_programs(post)

    def perform_update(self, serializer):
        post = serializer.save()
        files = self.request.FILES.getlist('post_img[]')
        if files:
            self._save_images(post)
        program_ids = self.request.data.getlist('used_programs[]')
        if program_ids:
            self._save_programs(post)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            if obj.post_owner != request.user.profile:
                raise exceptions.PermissionDenied('Você não tem permissão para modificar este post.')

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

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_used_program(self, request, pk=None):
        post = self.get_object()
        program_pk = request.data.get('program_pk')
        program = UsedPrograms.objects.get(id=program_pk)
        post.used_programs.remove(program)
        return Response({'success': True, 'program': program.program_name})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        profile = request.user.profile
        like_obj, created = Like.objects.get_or_create(
            like_owner=profile, like_post=post,
            defaults={'like': True},
        )
        if not created:
            like_obj.like_invert()
        return Response({'likes': post.like_num})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        post = self.get_object()
        profile = request.user.profile
        if profile.saved_posts.contains(post):
            profile.saved_posts.remove(post)
            return Response({'favorited': False})
        profile.saved_posts.add(post)
        return Response({'favorited': True})
