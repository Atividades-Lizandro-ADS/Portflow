from django.contrib import admin
from ..models import CommissionTier


@admin.register(CommissionTier)
class CommissionTierAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'profile', 'price', 'negotiable', 'negotiation_direction']
    list_filter = ['negotiable', 'negotiation_direction']
    search_fields = ['name', 'profile__user_profile__username']
