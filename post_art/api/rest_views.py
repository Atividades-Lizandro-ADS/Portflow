from rest_framework import generics,exceptions,viewsets
from .custom_paginators import PaginationCustom
from ..serializers import PostArtSerializers,PostArtSerializerRefresh,CommentSerializer,LikeSerializer,PostImageSerializer,UsedProgramsSerializer
from ..models import PostArt,UsedPrograms,Comments,Like,PostImages,About
from ..utility import get_object_or_none
from rest_framework import status
from rest_framework.response import Response


class PostsArtViewRefresh(generics.ListAPIView):
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
    lookup_field='id'
    lookup_url_kwarg='comment_pk'



    def get_queryset(self):
        comment=Comments.objects.filter(comment_owner=self.request.user.profile)
        return comment
    
class ImagePostArtAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class=serializer_class=PostImageSerializer
    lookup_field='id'
    lookup_url_kwarg='post_img_pk'
    queryset=PostImages.objects.all()

    def get_object(self):
        image= super().get_object()
        if image.image_post_owner.post_owner!=self.request.user.profile:
            raise exceptions.PermissionDenied("você não pode manipular essa imagem")
        return image

class AddLike(viewsets.ModelViewSet):
    serializer_class=LikeSerializer
    queryset=Like.objects.all()

    def get_object(self):
        profile=self.request.user.profile
        self.liked_post_id=int(self.request.data.get('like_post'))
        liked_post=PostArt.objects.get(id=self.liked_post_id)
        like_instance=Like.objects.get(like_owner=profile,like_post=liked_post)
        return like_instance
    
    def perform_create(self, serializer):
        try:
            like=self.get_object()
            like.like_invert()
            self._response_data=like.like_post.like_num
        except:
            profile=self.request.user.profile
            
            liked_post=PostArt.objects.get(id=self.liked_post_id)
            like=serializer.save(like_owner=profile,like_post=liked_post,like=True)
            self._response_data=liked_post.like_num
    
        

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({'likes':self._response_data})

