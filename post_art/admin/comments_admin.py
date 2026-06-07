from django.contrib import admin
from ..models import Comments


@admin.register(Comments)
class CommentsAdmin(admin.ModelAdmin):
    list_display = ['id', 'comment_owner', 'comment_post', 'created']
    search_fields = ['comment_text', 'comment_owner__user_profile__username']
