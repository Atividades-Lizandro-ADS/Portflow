from rest_framework import generics
from rest_framework.permissions import AllowAny

from ..customApiViews import RemoveUsedProgramBase
from ..serializers import UsedProgramsSerializer
from ...models import PostArt, About, UsedPrograms


class UsedProgramsView(generics.ListAPIView):
    serializer_class = UsedProgramsSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = UsedPrograms.objects.all()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(program_name__icontains=search)
        return qs


class RemoveUsedPrograms(RemoveUsedProgramBase):
    post_model = PostArt
    related_field = 'used_programs'

    def has_permission(self, user, remove_obj):
        return remove_obj.post_owner == user.profile


class RemoveUsedProgramsAbout(RemoveUsedProgramBase):
    post_model = About
    related_field = 'programs_known'

    def has_permission(self, user, remove_obj):
        return remove_obj.prof == user.profile
