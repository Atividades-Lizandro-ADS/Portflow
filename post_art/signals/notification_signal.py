from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Like, Comments, NotificationTemplate, Notification, MILESTONE_THRESHOLDS


def _get_template(code):
    try:
        return NotificationTemplate.objects.get(code=code)
    except Exception:
        return None


@receiver(post_save, sender=Like)
def notify_like(sender, instance, created, **kwargs):
    if not created:
        return

    post = instance.like_post
    owner = post.post_owner
    actor = instance.like_owner

    if owner == actor:
        return

    total_likes = Like.objects.filter(like_post=post, like=True).count()

    if total_likes == 1:
        template = _get_template('NEW_LIKE')
        if template:
            Notification.objects.create(
                recipient=owner,
                template=template,
                title=template.render_title({
                    'actor': actor.user_profile.username,
                    'post_title': post.tittle,
                }),
                actor=actor,
                target_post=post,
            )

    if total_likes in MILESTONE_THRESHOLDS:
        milestone_tpl = _get_template('POST_MILESTONE')
        if milestone_tpl:
            already = Notification.objects.filter(
                template=milestone_tpl,
                target_post=post,
                extra_data__count=total_likes,
            ).exists()
            if not already:
                Notification.objects.create(
                    recipient=owner,
                    template=milestone_tpl,
                    title=milestone_tpl.render_title({
                        'post_title': post.tittle,
                        'count': total_likes,
                    }),
                    target_post=post,
                    extra_data={'count': total_likes},
                )


@receiver(post_save, sender=Comments)
def notify_comment(sender, instance, created, **kwargs):
    if not created:
        return

    post = instance.comment_post
    owner = post.post_owner
    actor = instance.comment_owner

    if owner == actor:
        return

    template = _get_template('NEW_COMMENT')
    if template:
        Notification.objects.create(
            recipient=owner,
            template=template,
            title=template.render_title({
                'actor': actor.user_profile.username,
                'post_title': post.tittle,
            }),
            actor=actor,
            target_post=post,
        )
