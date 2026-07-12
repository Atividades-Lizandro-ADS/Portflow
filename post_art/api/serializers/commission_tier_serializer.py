from rest_framework import serializers
from ...models import CommissionTier


class CommissionTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionTier
        fields = (
            'id', 'profile', 'name', 'description', 'thumb',
            'price', 'negotiable', 'negotiation_direction', 'is_active',
        )
        read_only_fields = ('id', 'profile', 'is_active')
