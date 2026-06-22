from django.contrib import admin
from ..models import Follow


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ['id', 'follower', 'following', 'created_at']
    search_fields = ['follower__user_profile__username', 'following__user_profile__username']
    raw_id_fields = ['follower', 'following']
