from django.contrib import admin
from ..models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'user_profile']
    search_fields = ['first_name', 'user_profile__username']
