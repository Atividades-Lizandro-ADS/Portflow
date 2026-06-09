from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from ..models import Profile, NotificationTemplate, Notification


def _get_template(code):
    try:
        return NotificationTemplate.objects.get(code=code)
    except NotificationTemplate.DoesNotExist:
        return None


@receiver(pre_save, sender=Profile)
def capture_commissions_open(sender, instance, **kwargs):
    if not instance.pk:
        instance._old_commissions_open = False
        return
    try:
        instance._old_commissions_open = Profile.objects.get(pk=instance.pk).commissions_open
    except Profile.DoesNotExist:
        instance._old_commissions_open = False


@receiver(post_save, sender=Profile)
def notify_commissions_opened(sender, instance, created, **kwargs):
    if created:
        return

    old = getattr(instance, '_old_commissions_open', None)
    if old is not False or not instance.commissions_open:
        return

    template = _get_template('COMMISSIONS_OPENED')
    if not template:
        return

    from ..models import Follow
    followers = Follow.objects.filter(following=instance).select_related('follower')

    Notification.objects.bulk_create([
        Notification(
            recipient=follow.follower,
            template=template,
            title=template.render_title({'actor': instance.user_profile.username}),
            actor=instance,
            extra_data={'target_profile': instance.pk},
        )
        for follow in followers
    ])
