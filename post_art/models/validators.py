from django.core.exceptions import ValidationError

MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024


def validate_attachment_size(file):
    if file.size > MAX_ATTACHMENT_SIZE:
        raise ValidationError('O anexo não pode ultrapassar 10MB.')
