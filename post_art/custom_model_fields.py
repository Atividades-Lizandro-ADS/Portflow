import re
from django.db import models
from django.core.exceptions import ValidationError

# Primeiros 24 bytes de um .mview real: "thumbnail.jpg\x00image/jpeg\x00"
# O formato do Marmoset embeds um thumbnail JPEG no início do arquivo,
# precedido por esse header que identifica o conteúdo e o mime type.
MVIEW_MAGIC = b'thumbnail.jpg\x00image/jpeg'
MVIEW_MAX_SIZE = 30 * 1024 * 1024  # 30MB


class YoutubeUrlField(models.CharField):
    default_validators = []

    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 200
        super().__init__(*args, **kwargs)

    def validate(self, value, model_instance):
        super().validate(value, model_instance)
        self.validate_youtube_url(value)

    def validate_youtube_url(self, value):
        youtube_regex = r'^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$'
        if not re.match(youtube_regex, value):
            raise ValidationError('Por favor, insira um link válido do YouTube.')

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        del kwargs["max_length"]
        return name, path, args, kwargs


def validate_mview_file(value):
    if not value.name.lower().endswith('.mview'):
        raise ValidationError('Apenas arquivos .mview são permitidos.')

    if value.size > MVIEW_MAX_SIZE:
        raise ValidationError('O arquivo Marmoset não pode exceder 30MB.')

    value.seek(0)
    header = value.read(len(MVIEW_MAGIC))  # lê exatamente 24 bytes
    value.seek(0)

    if header != MVIEW_MAGIC:
        raise ValidationError(
            'O arquivo não é um .mview válido do Marmoset Toolbag. '
            'Exporte o arquivo diretamente pelo Marmoset Toolbag.'
        )


class SketchfabUrlField(models.CharField):
    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 200
        super().__init__(*args, **kwargs)

    def validate(self, value, model_instance):
        super().validate(value, model_instance)
        if value and 'sketchfab.com' not in value:
            raise ValidationError('Por favor, insira um link válido do Sketchfab.')

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        del kwargs['max_length']
        return name, path, args, kwargs


class MarmosetFileField(models.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('validators', [validate_mview_file])
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs.pop('validators', None)
        return name, path, args, kwargs
