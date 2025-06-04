from ..utility import get_object_or_none
from rest_framework import generics, status
from rest_framework.response import Response
from ..models import UsedPrograms

class RemoveUsedProgramBase(generics.GenericAPIView):
    post_model = None         # Modelo do objeto pai (PostArt, About, etc)
    related_field = None      # Nome do campo ManyToMany (ex: 'used_programs' ou 'programs_known')
    permission_check = True   # Se quiser checar permissão, override
    
    def delete(self, request, *args, **kwargs):
        post_id = self.kwargs.get('post_pk')
        program_id = self.kwargs.get('program_pk')

        remove_obj, _ = get_object_or_none(self.post_model, id=post_id)
        program_obj, _ = get_object_or_none(UsedPrograms, id=program_id)

        if remove_obj is None or program_obj is None:
            return Response({'error': 'Objeto não encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if self.permission_check:
            if not self.has_permission(request.user, remove_obj):
                return Response({'detail': 'Sem permissão'}, status=status.HTTP_403_FORBIDDEN)
        
        related_manager = getattr(remove_obj, self.related_field, None)
        if related_manager is None:
            return Response({'error': 'Campo relacionado inválido'}, status=status.HTTP_400_BAD_REQUEST)

        related_manager.remove(program_obj)
        
        return Response({'sucesso': True, 'program': program_obj.program_name}, status=status.HTTP_200_OK)
    
    def has_permission(self, user, remove_obj):
        return False
