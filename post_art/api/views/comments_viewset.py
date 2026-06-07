from rest_framework import viewsets, exceptions

from ..serializers import CommentSerializer
from ...models import Comments


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        qs = Comments.objects.select_related('comment_owner__user_profile').all()

        post_id = self.request.query_params.get('post')
        if post_id:
            qs = qs.filter(comment_post=post_id)

        from_this_user = self.request.query_params.get('from_this_user')
        if from_this_user and from_this_user.lower() == 'true':
            if not self.request.user.is_authenticated:
                return qs.none()
            qs = qs.filter(comment_owner=self.request.user.profile)

        return qs

    def perform_create(self, serializer):
        serializer.save(comment_owner=self.request.user.profile)

    def perform_update(self, serializer):
        if serializer.instance.comment_owner != self.request.user.profile:
            raise exceptions.PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.comment_owner != self.request.user.profile:
            raise exceptions.PermissionDenied()
        instance.delete()
