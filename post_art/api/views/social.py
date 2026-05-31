from rest_framework import generics, viewsets, status
from rest_framework.response import Response

from ..serializers import CommentSerializer, LikeSerializer, PostArtSerializer
from ...models import Comments, Like, PostArt


class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer

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


class CommentDestroyView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'comment_pk'

    def get_queryset(self):
        return Comments.objects.filter(comment_owner=self.request.user.profile)


class LikeView(viewsets.ModelViewSet):
    serializer_class = LikeSerializer
    queryset = Like.objects.all()

    def get_object(self):
        profile = self.request.user.profile
        self.liked_post_id = int(self.request.data.get('like_post'))
        liked_post = PostArt.objects.get(id=self.liked_post_id)
        return Like.objects.get(like_owner=profile, like_post=liked_post)

    def perform_create(self, serializer):
        try:
            like = self.get_object()
            like.like_invert()
            self._response_data = like.like_post.like_num
        except Exception:
            liked_post = PostArt.objects.get(id=self.liked_post_id)
            serializer.save(like_owner=self.request.user.profile, like_post=liked_post, like=True)
            self._response_data = liked_post.like_num

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({'likes': self._response_data})


class FavoriteView(generics.UpdateAPIView):
    serializer_class = PostArtSerializer
    queryset = PostArt.objects.all()
    lookup_url_kwarg = 'post_pk'

    def update(self, request, *args, **kwargs):
        post = self.get_object()
        profile = request.user.profile
        if profile.saved_posts.contains(post):
            profile.saved_posts.remove(post)
        else:
            profile.saved_posts.add(post)
        return Response({'success': True}, status=status.HTTP_200_OK)
