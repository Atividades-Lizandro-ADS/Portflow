from django.contrib import admin

from ..models import ChatAttachment


@admin.register(ChatAttachment)
class ChatAttachmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'message', 'original_filename', 'file_size']
