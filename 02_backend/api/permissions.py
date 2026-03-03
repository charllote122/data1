"""
Custom permissions for API access control
Define who can access what endpoints
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit.
    Assumes model instance has a `user` attribute.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user


class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners to access.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow read access to all authenticated users,
    write access only to admin users.
    """
    
    def has_permission(self, request, view):
        # Read methods are allowed
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write methods require admin
        return request.user and request.user.is_staff


class IsVerifiedUser(permissions.BasePermission):
    """
    Allow access only to verified users.
    Users must verify their email.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_verified
        )


class HasEnoughPredictions(permissions.BasePermission):
    """
    Allow access based on prediction count (for premium features).
    """
    min_predictions = 5
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.predictions.count() >= self.min_predictions


class IsDataOwner(permissions.BasePermission):
    """
    Check if user owns the data referenced in request.
    For filtering list views by user_id.
    """
    
    def has_permission(self, request, view):
        # For list views, check if requesting own data
        if 'user_id' in request.query_params:
            return str(request.user.id) == request.query_params['user_id']
        return True
    
    def has_object_permission(self, request, view, obj):
        # For detail views, check object ownership
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        return False


class CanExportData(permissions.BasePermission):
    """
    Check if user can export data (premium feature).
    Currently allows all authenticated users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class ReadOnly(permissions.BasePermission):
    """
    Allow only read-only access.
    """
    
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class IsAuthenticatedAndActive(permissions.BasePermission):
    """
    Allow access only to authenticated and active users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_active
        )
