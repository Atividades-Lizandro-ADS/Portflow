from django.contrib import admin
from ..models import UsedPrograms


@admin.register(UsedPrograms)
class UsedProgramsAdmin(admin.ModelAdmin):
    list_display = ['id', 'program_name']
    search_fields = ['program_name']
