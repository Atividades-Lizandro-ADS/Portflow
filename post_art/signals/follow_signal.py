from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Follow, NotificationTemplate, Notification, MILESTONE_THRESHOLDS


def _get_template(code):
    try:
        return NotificationTemplate.objects.get(code=code)
    except NotificationTemplate.DoesNotExist:
        return None


def _format_count(n):
    if n >= 1000:
        return f'{n / 1000:.1f}k'
    return str(n)


@receiver(post_save, sender=Follow)
def notify_new_follower(sender, instance, created, **kwargs):
    if not created:
        return

    following = instance.following
    follower = instance.follower
    actor_username = follower.user_profile.username

    total_followers = Follow.objects.filter(following=following).count()

    if total_followers == 1:
        template = _get_template('FIRST_FOLLOWER')
        if template:
            Notification.objects.create(
                recipient=following,
                template=template,
                title=template.render_title({'actor': actor_username}),
                actor=follower,
            )

    if total_followers in MILESTONE_THRESHOLDS:
        template = _get_template('FOLLOWER_MILESTONE')
        if template:
            already = Notification.objects.filter(
                template=template,
                recipient=following,
                extra_data__count=total_followers,
            ).exists()
            if not already:
                Notification.objects.create(
                    recipient=following,
                    template=template,
                    title=template.render_title({'count': _format_count(total_followers)}),
                    extra_data={'count': total_followers},
                )

    follower_own_count = Follow.objects.filter(following=follower).count()
    if follower_own_count >= 1000:
        template = _get_template('NOTABLE_FOLLOWER')
        if template:
            already = Notification.objects.filter(
                template=template,
                recipient=following,
                actor=follower,
            ).exists()
            if not already:
                Notification.objects.create(
                    recipient=following,
                    template=template,
                    title=template.render_title({
                        'actor': actor_username,
                        'followers_count': _format_count(follower_own_count),
                    }),
                    actor=follower,
                )
