from rest_framework import generics,permissions,authentication,exceptions
from rest_framework import viewsets

from .serializers import PostArtSerializers,PostArtSerializerRefresh,CommentSerializer,LikeSerializer,PostImageSerializer,UsedProgramsSerializer
from rest_framework.pagination import PageNumberPagination
from .models import PostArt,UsedPrograms,Profile,Comments,Like,PostImages,About
from .utility import get_object_or_none
from rest_framework import status
from rest_framework.response import Response



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

class UsedProgramsView(generics.ListAPIView):
    serializer_class=UsedProgramsSerializer
    queryset=UsedPrograms.objects.all()
    

    def get_queryset(self):
        search=self.request.GET.get('search')
        queryset=UsedPrograms.objects.all()
        if search:
            queryset=UsedPrograms.objects.filter(program_name__icontains=search) 
        return queryset


class RemoveUsedPrograms(generics.GenericAPIView):
    def get(self,request,*args,**kwargs):
        post_id=self.kwargs.get('post_pk')
        program_id=self.kwargs.get('program_pk')
        post,_=get_object_or_none(PostArt,id=post_id)
        program,_=get_object_or_none(UsedPrograms,id=program_id)

        if post is None or program is None:
            return Response(data={'error'},status=status.HTTP_404_NOT_FOUND)
        
        post.used_programs.remove(program)

        return Response(data={'sucesso':True,'program':program.program_name,},status=status.HTTP_200_OK)
    
class RemoveUsedProgramsAbout(generics.GenericAPIView):
    def get(self,request,*args,**kwargs):
        post_id=self.kwargs.get('post_pk')
        program_id=self.kwargs.get('program_pk')
        about,_=get_object_or_none(About,id=post_id)
        program,_=get_object_or_none(UsedPrograms,id=program_id)

        if about is None or program is None:
            return Response(data={'error'},status=status.HTTP_404_NOT_FOUND)
        
        about.programs_known.remove(program)

        return Response(data={'sucesso':True,'program':program.program_name,},status=status.HTTP_200_OK)
    
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
    
class delete_comment(generics.DestroyAPIView):
    serializer_class=CommentSerializer
    authentication_classes=[authentication.SessionAuthentication]
    permission_classes=[permissions.IsAuthenticated]
    lookup_field='id'
    lookup_url_kwarg='comment_pk'



    def get_queryset(self):
        comment=Comments.objects.filter(comment_owner=self.request.user.profile)
        return comment
    
class update_postArt_Image(generics.UpdateAPIView):
    serializer_class=PostImageSerializer
    authentication_classes=[authentication.SessionAuthentication]
    permission_classes=[permissions.IsAuthenticated]
    lookup_field='id'
    lookup_url_kwarg='post_img_pk'
    queryset=PostImages.objects.all()

    def get_object(self):
        obj= super().get_object()
        if obj.image_post_owner.post_owner != self.request.user.profile:
            raise exceptions.PermissionDenied("você não pode editar essa imagem")
        return obj

    
class delete_post_image(generics.DestroyAPIView):
    serializer_class=PostImageSerializer
    authentication_classes=[authentication.SessionAuthentication]
    permission_classes=[permissions.IsAuthenticated]
    lookup_field='id'
    lookup_url_kwarg='post_image_pk'



    def get_queryset(self):
        image=PostImages.objects.filter(image_post_owner__post_owner=self.request.user.profile)
        return image

class add_like(generics.CreateAPIView):
    serializer_class=LikeSerializer
    authentication_classes=[authentication.SessionAuthentication]
    permission_classes=[permissions.IsAuthenticated]

    def perform_create(self, serializer):
        self.instance=serializer.save(like_owner=self.request.user.profile,like=True)
    
    def create(self, request, *args, **kwargs):
        like_owner=int(request.data.get('like_owner'))
        like_post=int(request.data.get('like_post'))
        like,_=get_object_or_none(Like,like_owner__id=like_owner,like_post__id=like_post)

        if like is None:
            response= super().create(request, *args, **kwargs)
            response.data['likes']=self.instance.like_post.like_num
            return response
            
        
        like.like= not like.like
        like.save()

        return Response(data={
            'success':True,
            'likes':like.like_post.like_num
        },status=status.HTTP_200_OK)


"""API v2"""

class PostArtViewset(viewsets.ModelViewSet):
    queryset=PostArt.objects.all()
    serializer_class=PostArtSerializers