import random

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from post_art.models import PostArt, PostImages, Profile
from post_art.models.post_images import CELL_SIZE_CHOICES


class Command(BaseCommand):
    help = 'Duplica um post (e suas PostImages) N vezes, com owner e cell_size aleatórios'

    def add_arguments(self, parser):
        parser.add_argument('--post-id', type=int, default=None, help='ID do post a duplicar (default: primeiro post existente)')
        parser.add_argument('--count', type=int, default=10, help='Quantas cópias criar (default: 10)')

    def handle(self, *args, **options):
        post_id = options['post_id']
        count = options['count']

        source = PostArt.objects.filter(pk=post_id).first() if post_id else PostArt.objects.first()
        if source is None:
            raise CommandError('Nenhum post encontrado para duplicar.')

        owners = list(Profile.objects.all())
        if not owners:
            raise CommandError('Nenhum Profile encontrado para usar como owner.')

        source_images = list(source.postimages_set.all())
        used_programs = list(source.used_programs.all())
        cell_sizes = [choice[0] for choice in CELL_SIZE_CHOICES]

        created = 0
        with transaction.atomic():
            for _ in range(count):
                clone = PostArt(
                    post_owner=random.choice(owners),
                    post_thumb=source.post_thumb.name,
                    tittle=source.tittle,
                    caption=source.caption,
                    description=source.description,
                    art_type=source.art_type,
                    category=source.category,
                    youtube_link=source.youtube_link,
                    sketchfab_link=source.sketchfab_link,
                    marmoview=source.marmoview.name if source.marmoview else None,
                    keywords=source.keywords,
                    published=source.published,
                    display_type=source.display_type,
                    is_mature=source.is_mature,
                )
                clone.save()
                clone.used_programs.set(used_programs)

                for img in source_images:
                    PostImages.objects.create(
                        post_img=img.post_img.name,
                        acessibility_caption=img.acessibility_caption,
                        caption=img.caption,
                        image_post_owner=clone,
                        cell_size_x=random.choice(cell_sizes),
                        cell_size_y=random.choice(cell_sizes),
                        is_mature=img.is_mature,
                    )
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'{created} cópias de "{source.tittle}" criadas (owners e cell_size aleatórios).'
        ))
