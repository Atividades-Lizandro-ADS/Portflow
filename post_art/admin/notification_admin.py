from django.contrib import admin
from ..models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'recipient', 'template', 'title', 'is_read', 'created_at']
    list_filter = ['is_read', 'template']
    search_fields = ['title', 'recipient__user_profile__username']
    readonly_fields = ['created_at', 'extra_data']
