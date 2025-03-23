from django.contrib import admin
from .models import PostArt,UsedPrograms,Profile,Category,PostImages,Comments


admin.site.register(PostArt)

admin.site.register(UsedPrograms)
admin.site.register(PostImages)
admin.site.register(Profile)
admin.site.register(Category)
admin.site.register(Comments)