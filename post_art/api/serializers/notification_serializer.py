from rest_framework import serializers
from ...models import Notification
from .notification_template_serializer import NotificationTemplateSerializer


class NotificationSerializer(serializers.ModelSerializer):
    template = NotificationTemplateSerializer(read_only=True)
    actor_username = serializers.CharField(
        source='actor.user_profile.username',
        read_only=True,
        default=None,
    )
    target_post_id = serializers.IntegerField(
        source='target_post.pk',
        read_only=True,
        default=None,
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'template', 'title', 'is_read',
            'created_at', 'actor_username', 'target_post_id', 'extra_data',
        ]
        read_only_fields = [
            'id', 'template', 'title', 'created_at',
            'actor_username', 'target_post_id', 'extra_data',
        ]
