from django.contrib import admin

from ..models import Briefing


@admin.register(Briefing)
class BriefingAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'status', 'agreed_price', 'deadline', 'created_at']
    list_filter = ['status']
