from rest_framework import generics, exceptions

from ..serializers import PostImageSerializer
from ...models import PostImages


class PostImageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostImageSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'post_img_pk'
    queryset = PostImages.objects.all()

    def get_object(self):
        image = super().get_object()
        if image.image_post_owner.post_owner != self.request.user.profile:
            raise exceptions.PermissionDenied('Você não pode manipular essa imagem.')
        return image
