from django.db import models

class Skill(models.Model):
    skill_type = models.CharField(max_length=140)

    def __str__(self):
        return self.skill_type