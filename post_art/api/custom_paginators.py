from rest_framework.pagination import PageNumberPagination


class PaginationCustom(PageNumberPagination):
    page_size = 12


class ProfilePaginationCustom(PageNumberPagination):
    page_size = 5
