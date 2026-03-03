"""
Custom throttling classes for rate limiting
Prevent API abuse and ensure fair usage
"""

from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.utils import timezone


class PredictionThrottle(UserRateThrottle):
    """
    Limit prediction requests
    Authenticated users: 60/hour (as defined in settings)
    """
    scope = 'predictions'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return f'throttle_prediction_{request.user.id}'
        return self.get_ident(request)
    
    def allow_request(self, request, view):
        # Check if user is verified (higher limits)
        if request.user.is_authenticated and request.user.is_verified:
            # Override the rate for verified users
            self.rate = '100/hour'  # Verified users get 100/hour
        else:
            self.rate = '60/hour'   # Regular users get 60/hour
        return super().allow_request(request, view)


class BurstRateThrottle(UserRateThrottle):
    """
    Prevent rapid-fire requests
    10 requests per minute (as defined in settings)
    """
    scope = 'burst'
    rate = '10/minute'
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return f'throttle_burst_{request.user.id}'
        return self.get_ident(request)


class SustainedRateThrottle(UserRateThrottle):
    """
    Limit sustained usage
    1000 requests per day (as defined in settings for user scope)
    """
    scope = 'user'  # Uses the 'user' rate from settings (1000/day)
    
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return f'throttle_sustained_{request.user.id}'
        return self.get_ident(request)


class AdminRateThrottle(UserRateThrottle):
    """
    Higher limits for admin users
    """
    scope = 'admin'
    
    def allow_request(self, request, view):
        # Admin users have no limits
        if request.user and request.user.is_staff:
            return True
        return super().allow_request(request, view)


class VerifiedUserThrottle(UserRateThrottle):
    """
    Better rates for verified users
    """
    scope = 'verified'
    
    def allow_request(self, request, view):
        if request.user and request.user.is_authenticated:
            if request.user.is_verified:
                self.rate = '200/hour'
                self.num_requests = 200
            else:
                self.rate = '30/hour'
                self.num_requests = 30
        return super().allow_request(request, view)


class FreeTierThrottle(UserRateThrottle):
    """
    Limit free tier users
    30 predictions per day
    """
    scope = 'free'
    rate = '30/day'
    
    def allow_request(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Count today's predictions
        today = timezone.now().date()
        today_count = request.user.predictions.filter(
            prediction_date__date=today
        ).count()
        
        if today_count >= 30:
            return False
        
        return super().allow_request(request, view)


class AnonThrottle(AnonRateThrottle):
    """
    Rate limiting for anonymous users
    100/day (as defined in settings for anon scope)
    """
    scope = 'anon'  # Uses the 'anon' rate from settings (100/day)


class ScopedRateThrottle(UserRateThrottle):
    """
    Throttle by view scope
    """
    scope_attr = 'throttle_scope'
    
    def get_cache_key(self, request, view):
        scope = getattr(view, self.scope_attr, None)
        if scope:
            return self.cache_format % {
                'scope': scope,
                'ident': self.get_ident(request)
            }
        return None