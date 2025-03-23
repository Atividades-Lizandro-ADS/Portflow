from rest_framework import generics,permissions,authentication
from rest_framework import viewsets

from .serializers import PostArtSerializers,PostArtSerializerRefresh,CommentSerializer
from rest_framework.pagination import PageNumberPagination
from .models import PostArt,UsedPrograms,Profile,Comments


"""API v1"""


class PostsArtView(generics.ListCreateAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializers


class PaginationCustom(PageNumberPagination):
    page_size=12

class PostsArtViewRefresh(generics.ListCreateAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializerRefresh
    pagination_class=PaginationCustom

class PostArtView(generics.RetrieveUpdateDestroyAPIView):
    queryset=posts=PostArt.objects.all()
    serializer_class=PostArtSerializers


class add_comment(generics.CreateAPIView):
    serializer_class=CommentSerializer
    authentication_classes=[authentication.SessionAuthentication]
    permission_classes=[permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(comment_owner=self.request.user.profile)
    
    def create(self, request, *args, **kwargs):
        response= super().create(request, *args, **kwargs)

        response.data['owner']={
            'user_picture':request.user.profile.user_picture.url,
            'username':request.user.profile.first_name,
            'user_id':request.user.profile.id
        }
        return response


"""API v2"""

class PostArtViewset(viewsets.ModelViewSet):
    queryset=PostArt.objects.all()
    serializer_class=PostArtSerializers