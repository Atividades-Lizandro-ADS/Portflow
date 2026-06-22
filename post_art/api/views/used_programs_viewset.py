from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from ..serializers import UsedProgramsSerializer
from ...models import UsedPrograms


class UsedProgramsViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'head', 'options']
    serializer_class = UsedProgramsSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = UsedPrograms.objects.all()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(program_name__icontains=search)
        return qs
