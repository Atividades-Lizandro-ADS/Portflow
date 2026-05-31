from django.db import models

class UsedPrograms(models.Model):
    program_name = models.CharField(max_length=100)
    program_logo = models.ImageField(blank=True, upload_to='programs/images')

    def __str__(self):
        return self.program_name

    def save(self, *args, **kwargs):
        self.program_name = self.program_name.title()
        return super().save(*args, **kwargs)
