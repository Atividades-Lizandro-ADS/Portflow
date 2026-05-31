from decouple import config

REDIS_URL = config('REDIS_URL', default='redis://localhost:6379')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'{REDIS_URL}/0',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'portflow',
    }
}

# db=1 reservado para notificações (pub/sub ou lista de eventos por usuário)
NOTIFICATIONS_REDIS_URL = f'{REDIS_URL}/1'
