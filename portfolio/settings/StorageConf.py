from decouple import config

MINIO_BUCKET_NAME = config('MINIO_BUCKET_NAME', default='portflow-media')
_minio_endpoint = config('MINIO_ENDPOINT', default='minio:9000')
_minio_public_url = config('MINIO_PUBLIC_URL', default='localhost:9000')
_use_https = config('MINIO_USE_HTTPS', default=False, cast=bool)
_protocol = 'https' if _use_https else 'http'

AWS_ACCESS_KEY_ID = config('MINIO_ROOT_USER')
AWS_SECRET_ACCESS_KEY = config('MINIO_ROOT_PASSWORD')
AWS_STORAGE_BUCKET_NAME = MINIO_BUCKET_NAME
AWS_S3_ENDPOINT_URL = f'{_protocol}://{_minio_endpoint}'
AWS_S3_CUSTOM_DOMAIN = f'{_minio_public_url}/{MINIO_BUCKET_NAME}'
AWS_S3_URL_PROTOCOL = f'{_protocol}:'
AWS_S3_ADDRESSING_STYLE = 'path'
AWS_DEFAULT_ACL = 'public-read'
AWS_S3_FILE_OVERWRITE = False
AWS_QUERYSTRING_AUTH = False

STORAGES = {
    'default': {
        'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
    },
    'staticfiles': {
        'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
    },
}
