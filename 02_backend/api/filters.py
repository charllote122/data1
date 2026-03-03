
"""
Custom filter backends for API filtering
Enable searching, sorting, and filtering of results
"""

from rest_framework import filters
import django_filters
from predictions.models import Prediction
from users.models import User


class PredictionFilter(django_filters.FilterSet):
    """
    Filter predictions by various criteria
    Available for history endpoints
    """
    
    # Date filters
    date_from = django_filters.DateFilter(
        field_name='prediction_date', 
        lookup_expr='gte',
        help_text="Start date (YYYY-MM-DD)"
    )
    date_to = django_filters.DateFilter(
        field_name='prediction_date', 
        lookup_expr='lte',
        help_text="End date (YYYY-MM-DD)"
    )
    year = django_filters.NumberFilter(
        field_name='prediction_date', 
        lookup_expr='year',
        help_text="Filter by year"
    )
    month = django_filters.NumberFilter(
        field_name='prediction_date', 
        lookup_expr='month',
        help_text="Filter by month (1-12)"
    )
    
    # Risk filters
    risk_level = django_filters.ChoiceFilter(
        choices=Prediction.RISK_LEVELS,
        help_text="Filter by risk level: low/moderate/high"
    )
    min_risk = django_filters.NumberFilter(
        field_name='risk_score', 
        lookup_expr='gte',
        help_text="Minimum risk score (0-100)"
    )
    max_risk = django_filters.NumberFilter(
        field_name='risk_score', 
        lookup_expr='lte',
        help_text="Maximum risk score (0-100)"
    )
    
    # User filters (admin only)
    username = django_filters.CharFilter(
        field_name='user__username', 
        lookup_expr='icontains',
        help_text="Filter by username (partial match)"
    )
    
    class Meta:
        model = Prediction
        fields = ['risk_level', 'user_id', 'username']


class UserFilter(django_filters.FilterSet):
    """
    Filter users (admin only)
    """
    
    date_joined_from = django_filters.DateFilter(
        field_name='date_joined', 
        lookup_expr='gte',
        help_text="Joined after this date"
    )
    date_joined_to = django_filters.DateFilter(
        field_name='date_joined', 
        lookup_expr='lte',
        help_text="Joined before this date"
    )
    is_verified = django_filters.BooleanFilter(
        help_text="Filter by verification status"
    )
    is_active = django_filters.BooleanFilter(
        help_text="Filter by active status"
    )
    has_predictions = django_filters.BooleanFilter(
        method='filter_has_predictions',
        help_text="Filter users with/without predictions"
    )
    min_predictions = django_filters.NumberFilter(
        method='filter_min_predictions',
        help_text="Minimum number of predictions"
    )
    
    class Meta:
        model = User
        fields = ['is_verified', 'is_active', 'is_staff']
    
    def filter_has_predictions(self, queryset, name, value):
        """Filter users by whether they have predictions"""
        if value:
            return queryset.filter(predictions__isnull=False).distinct()
        return queryset.filter(predictions__isnull=True)
    
    def filter_min_predictions(self, queryset, name, value):
        """Filter users with at least N predictions"""
        from django.db.models import Count
        return queryset.annotate(
            pred_count=Count('predictions')
        ).filter(pred_count__gte=value)


class SearchFilter(filters.SearchFilter):
    """
    Enhanced search filter with multiple field support
    Usage: ?q=search_term&search_fields=field1,field2
    """
    search_param = 'q'
    
    def get_search_fields(self, view, request):
        # Allow client to specify search fields
        fields = request.query_params.get('search_fields', None)
        if fields:
            return [field.strip() for field in fields.split(',')]
        return super().get_search_fields(view, request)


class OrderingFilter(filters.OrderingFilter):
    """
    Enhanced ordering filter with multiple sort fields
    Usage: ?sort=field1,-field2 (descending)
    """
    ordering_param = 'sort'
    
    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param)
        if params:
            return [param.strip() for param in params.split(',')]
        return super().get_ordering(request, queryset, view)


class RangeFilterBackend(filters.BaseFilterBackend):
    """
    Filter by range (e.g., ?risk_score=20,80)
    Format: field_name=min,max
    """
    
    def filter_queryset(self, request, queryset, view):
        for param, value in request.query_params.items():
            if ',' in value and '__range' not in param:
                try:
                    min_val, max_val = value.split(',')
                    field_name = param
                    queryset = queryset.filter(**{
                        f"{field_name}__gte": float(min_val),
                        f"{field_name}__lte": float(max_val)
                    })
                except (ValueError, TypeError):
                    pass
        return queryset


class MultipleChoiceFilter(filters.BaseFilterBackend):
    """
    Filter by multiple values (e.g., ?risk_level=low,moderate)
    """
    
    def filter_queryset(self, request, queryset, view):
        for param, value in request.query_params.items():
            if ',' in value and '__in' not in param:
                values = value.split(',')
                queryset = queryset.filter(**{f"{param}__in": values})
        return queryset
