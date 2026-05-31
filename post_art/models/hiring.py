from django.db import models

class Hiring(models.Model):
    hire_type = models.CharField(max_length=140)

    def __str__(self):
        return self.hire_type