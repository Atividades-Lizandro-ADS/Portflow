from django.db import models


class About(models.Model):
    prof = models.OneToOneField('Profile', on_delete=models.CASCADE)
    programs_known = models.ManyToManyField('UsedPrograms')
    hiring = models.ManyToManyField('Hiring')
    skills = models.ManyToManyField('Skill')
    summary = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.prof.first_name
