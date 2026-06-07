from django.contrib import admin
from ..models import Skill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['id', 'skill_type']
    search_fields = ['skill_type']
