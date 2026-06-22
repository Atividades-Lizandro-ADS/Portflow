from django.contrib import admin
from ..models import About


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ['id', 'prof', 'summary']
    search_fields = ['prof__user_profile__username', 'summary']
