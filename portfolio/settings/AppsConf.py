INSTALLED_APPS = []

DEFAULT_APPS=[
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

]


THIRD_PARTY_APPS=[
    'rest_framework',
    'django_filters',
    'rest_framework.authtoken',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
]

PROJECT_APPS=[
    'post_art',
]

INSTALLED_APPS+=DEFAULT_APPS
INSTALLED_APPS+=PROJECT_APPS
INSTALLED_APPS+=THIRD_PARTY_APPS