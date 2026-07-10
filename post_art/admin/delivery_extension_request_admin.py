from django.contrib import admin

from ..models import DeliveryExtensionRequest


@admin.register(DeliveryExtensionRequest)
class DeliveryExtensionRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'briefing', 'current_deadline', 'new_deadline', 'status', 'created_at']
    list_filter = ['status']
