import re
from django.db import models
from django.core.exceptions import ValidationError


class YoutubeUrlField(models.CharField):
    default_validators = []

    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 200  # Defina um comprimento máximo adequado
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


    
class MarmosetFileField(models.FileField):
    def __init__(self, *args, **kwargs):
        # kwargs['validators'] = [self.validate_mview_file]
        super().__init__(*args, **kwargs)

    # def validate_mview_file(self,value):
    #     if not value.name.endswith('.mview'):
    #         raise ValidationError('Apenas arquivos .mview são permitidos.')

    #     try:
    #         with value.open('rb') as f:
    #             header = f.read(24)
    #             print(f"Cabeçalho lido (hex): {header.hex()}")  # Debug: Exibe os bytes em hexadecimal
    #             print(f"Cabeçalho lido (ASCII): {header}")  # Debug: Exibe os bytes em ASCII

    #             # Define o cabeçalho esperado
    #             expected_header = b'thumbnail.jpegimage/jpeg'
    #             if header != expected_header:
    #                 raise ValidationError('O arquivo .mview não possui um cabeçalho válido.')

    #     except Exception as e:
    #         raise ValidationError(f'Erro ao validar o arquivo: {str(e)}')

    def deconstruct(self):
        """
        Necessário para serializar o campo durante as migrações.
        """
        name, path, args, kwargs = super().deconstruct()
        # Remove o validador personalizado dos kwargs para evitar problemas
        # if 'validators' in kwargs:
        #     del kwargs['validators']
        return name, path, args, kwargs
    

