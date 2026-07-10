from django.contrib import admin

from ..models import BriefingAttachment


@admin.register(BriefingAttachment)
class BriefingAttachmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'briefing', 'original_filename', 'file_size']
