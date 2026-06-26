import redis as redis_lib
from django.conf import settings
from django.http import HttpResponse, StreamingHttpResponse
from django.views import View
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken

_KEEPALIVE_TIMEOUT = 25


class NotificationStreamView(View):
    def get(self, request):
        try:
            token = AccessToken(request.GET.get('token', ''))
            user_id = token['user_id']
        except (TokenError, Exception):
            return HttpResponse('Unauthorized', status=401)

        channel = f'notifications:user:{user_id}'

        def event_stream():
            client = redis_lib.from_url(settings.NOTIFICATIONS_REDIS_URL)
            pubsub = client.pubsub()
            pubsub.subscribe(channel)
            try:
                while True:
                    message = pubsub.get_message(
                        ignore_subscribe_messages=True,
                        timeout=_KEEPALIVE_TIMEOUT,
                    )
                    if message and message['type'] == 'message':
                        yield f'data: {message["data"].decode()}\n\n'
                    else:
                        yield ': keepalive\n\n'
            except GeneratorExit:
                pass
            finally:
                pubsub.unsubscribe()
                pubsub.close()
                client.close()

        response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
