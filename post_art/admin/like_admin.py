from django.contrib import admin
from ..models import Like


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'like_owner', 'like_post', 'like']
    list_filter = ['like']
