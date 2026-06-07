from django.contrib import admin
from ..models import PostArt


@admin.register(PostArt)
class PostArtAdmin(admin.ModelAdmin):
    list_display = ['id', 'tittle', 'post_owner', 'art_type', 'published', 'creation_date']
    list_filter = ['art_type', 'published', 'display_type']
    search_fields = ['tittle', 'caption', 'post_owner__user_profile__username']
