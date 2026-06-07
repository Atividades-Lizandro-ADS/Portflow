from rest_framework import viewsets, exceptions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from ..serializers import AboutWriteSerializer
from ...models import About, UsedPrograms


class AboutViewSet(viewsets.ModelViewSet):
    serializer_class = AboutWriteSerializer

    def get_queryset(self):
        return About.objects.all()

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method not in ('GET', 'HEAD', 'OPTIONS'):
            if obj.prof != request.user.profile:
                raise exceptions.PermissionDenied('Você não pode editar este about.')

    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_used_program(self, request, pk=None):
        about = self.get_object()
        program_pk = request.data.get('program_pk')
        program = UsedPrograms.objects.get(id=program_pk)
        about.programs_known.remove(program)
        return Response({'success': True, 'program': program.program_name})
