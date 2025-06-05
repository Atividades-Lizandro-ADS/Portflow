REST_FRAMEWORK ={
    'DEFAULT_AUTHENTICATION_CLASSES':(
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES':(
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS':'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE':10,
    'DEFAULT_THROTTLE_CLASSES':(
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        ),
    'DEFAULT_THROTTLE_RATES':{
        'anon':'5/minute',
        'user':'10/minute',
    }
}