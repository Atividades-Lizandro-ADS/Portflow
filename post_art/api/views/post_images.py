from rest_framework import viewsets, exceptions

from ..serializers import PostImageSerializer
from ...models import PostImages


class PostImageViewSet(viewsets.ModelViewSet):
    serializer_class = PostImageSerializer
    queryset = PostImages.objects.all()

    def get_object(self):
        image = super().get_object()
        if image.image_post_owner.post_owner != self.request.user.profile:
            raise exceptions.PermissionDenied('Você não pode manipular essa imagem.')
        return image
