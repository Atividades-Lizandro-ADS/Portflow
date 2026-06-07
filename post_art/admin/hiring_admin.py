from django.contrib import admin
from ..models import Hiring


@admin.register(Hiring)
class HiringAdmin(admin.ModelAdmin):
    list_display = ['id', 'hire_type']
    search_fields = ['hire_type']
