
"""
Custom pagination classes for API responses
Control how large datasets are split into pages
"""

from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination
from rest_framework.response import Response
import math


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination with page numbers
    Default: 20 items per page
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'
    
    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'total': self.page.paginator.count,
                'page': self.page.number,
                'page_size': self.get_page_size(self.request),
                'total_pages': math.ceil(
                    self.page.paginator.count / self.get_page_size(self.request)
                ),
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            },
            'results': data
        })


class LargeResultsSetPagination(PageNumberPagination):
    """
    Larger page size for bulk operations
    Default: 100 items per page
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class SmallResultsSetPagination(PageNumberPagination):
    """
    Small page size for detailed views
    Default: 10 items per page
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class HistoryPagination(PageNumberPagination):
    """
    Special pagination for prediction history
    Shows more metadata for history views
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'total': self.page.paginator.count,
                'page': self.page.number,
                'page_size': self.get_page_size(self.request),
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
                'next_page': self.page.next_page_number() if self.page.has_next() else None,
                'previous_page': self.page.previous_page_number() if self.page.has_previous() else None,
            },
            'history': data
        })


class CustomLimitOffsetPagination(LimitOffsetPagination):
    """
    Limit-offset pagination alternative
    Allows client to specify limit and offset directly
    """
    default_limit = 20
    max_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    
    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'total': self.count,
                'limit': self.limit,
                'offset': self.offset,
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
                'has_next': self.offset + self.limit < self.count,
                'has_previous': self.offset > 0,
            },
            'results': data
        })
