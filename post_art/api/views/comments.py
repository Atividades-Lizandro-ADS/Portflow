from rest_framework import viewsets

from ..serializers import CommentSerializer
from ...models import Comments


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        qs = Comments.objects.all()

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

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        profile = request.user.profile
        response.data['owner'] = {
            'user_picture': profile.user_picture.url if profile.user_picture else None,
            'username': profile.first_name,
            'user_id': profile.id,
        }
        return response
