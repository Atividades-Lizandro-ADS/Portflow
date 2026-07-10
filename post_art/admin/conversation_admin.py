from django.contrib import admin

from ..models import Conversation


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'client', 'artist', 'tier', 'created_at']
    search_fields = ['client__user_profile__username', 'artist__user_profile__username', 'tier__name']
