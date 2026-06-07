from django.contrib import admin
from ..models import NotificationTemplate


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'title_template']
    search_fields = ['code', 'name']
