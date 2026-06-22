from django.db import models

MILESTONE_THRESHOLDS = frozenset([10, 50, 100, 500, 1000, 5000, 10000])


class NotificationTemplate(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    title_template = models.CharField(max_length=255)

    class Meta:
        verbose_name = 'Template de Notificação'
        verbose_name_plural = 'Templates de Notificação'

    def __str__(self):
        return f'[{self.code}] {self.name}'

    def render_title(self, context: dict) -> str:
        try:
            return self.title_template.format(**context)
        except (KeyError, IndexError):
            return self.name
