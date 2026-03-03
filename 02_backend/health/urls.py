from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router
router = DefaultRouter()
router.register(r'profile', views.HealthProfileViewSet, basename='health-profile')
router.register(r'goals', views.HealthGoalViewSet, basename='health-goals')
router.register(r'family-history', views.FamilyHistoryViewSet, basename='family-history')
router.register(r'milestones', views.MilestoneViewSet, basename='milestones')

# Get router URLs
router_urls = router.urls

# URL patterns
urlpatterns = [
    # Include all router URLs
    path('', include(router_urls)),
    
    # Custom dashboard endpoint
    path('dashboard/', views.HealthProfileViewSet.as_view({'get': 'dashboard'}), name='health-dashboard'),
]