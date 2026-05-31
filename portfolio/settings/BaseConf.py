from pathlib import Path
from decouple import config, Csv
from .RestConf import REST_FRAMEWORK
from .AppsConf import INSTALLED_APPS
from .DatabaseConf import DATABASES
from .CacheConf import CACHES, NOTIFICATIONS_REDIS_URL
from .StorageConf import STORAGES, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, \
    AWS_STORAGE_BUCKET_NAME, AWS_S3_ENDPOINT_URL, AWS_S3_CUSTOM_DOMAIN, \
    AWS_S3_URL_PROTOCOL, AWS_S3_ADDRESSING_STYLE, AWS_DEFAULT_ACL, \
    AWS_S3_FILE_OVERWRITE, AWS_QUERYSTRING_AUTH

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost', cast=Csv())

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='', cast=Csv())

ROOT_URLCONF = 'portfolio.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR/'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portfolio.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Fortaleza'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles/'
STATICFILES_DIRS = [BASE_DIR / 'templates/static']
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LOGIN_URL = '/authentication/login'
