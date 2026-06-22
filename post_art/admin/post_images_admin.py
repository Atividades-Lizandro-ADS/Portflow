from django.contrib import admin
from ..models import PostImages


@admin.register(PostImages)
class PostImagesAdmin(admin.ModelAdmin):
    list_display = ['id', 'image_post_owner', 'caption', 'cell_size_x', 'cell_size_y']
    search_fields = ['caption', 'acessibility_caption']
