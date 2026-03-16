# predictions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'predictions', views.PredictionViewSet, basename='prediction')
router.register(r'goals', views.GoalViewSet, basename='goal')
router.register(r'medications', views.MedicationViewSet, basename='medication')
router.register(r'symptoms', views.SymptomViewSet, basename='symptom')
router.register(r'challenges', views.ChallengeViewSet, basename='challenge')
router.register(r'family-history', views.FamilyHistoryViewSet, basename='family-history')  # Add this line

urlpatterns = [
    # Feature info
    path('features/', views.feature_info, name='feature-info'),
    
    # Public endpoints
    path('public/predict/', views.public_predict, name='public-predict'),
    path('public/tips/', views.public_tips, name='public-tips'),
    path('public/dashboard/', views.public_dashboard, name='public-dashboard'),
    
    # Health profile endpoints
    path('health/profile/', views.health_profile, name='health-profile'),
    path('health/metrics/', views.update_health_metrics, name='update-metrics'),
    path('health/history/', views.health_history, name='health-history'),
    
    # Analytics endpoints
    path('analytics/summary/', views.analytics_summary, name='analytics-summary'),
    path('export/', views.export_data, name='export-data'),
    
    # Alternative paths for frontend compatibility
    # These map to the router-based endpoints
    path('predictions/stats/', views.PredictionViewSet.as_view({'get': 'stats'}), name='prediction-stats'),
    path('predictions/trends/', views.PredictionViewSet.as_view({'get': 'trends'}), name='prediction-trends'),
    path('predictions/dashboard/', views.PredictionViewSet.as_view({'get': 'dashboard'}), name='prediction-dashboard'),
    path('predictions/my-predictions/', views.PredictionViewSet.as_view({'get': 'my_predictions'}), name='prediction-my'),
    
    # Include router URLs
    path('', include(router.urls)),
]