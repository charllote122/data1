from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'predict', views.PredictionViewSet, basename='predict')
router.register(r'explain', views.ExplanationViewSet, basename='explain')
router.register(r'export', views.ExportViewSet, basename='export')
router.register(r'admin', views.AdminViewSet, basename='admin')

urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('health/', views.health_check, name='health-check'),
    path('features/', views.feature_info, name='feature-info'),
    path('user/', views.current_user, name='current-user'),
    path('', include(router.urls)),
    path('history/', views.PredictionViewSet.as_view({'get': 'history'}), name='prediction-history'),
    path('stats/', views.PredictionViewSet.as_view({'get': 'stats'}), name='prediction-stats'),
    path('predictions/<int:pk>/', views.PredictionViewSet.as_view({'get': 'detail'}), name='prediction-detail'),
    path('predictions/<int:pk>/delete/', views.PredictionViewSet.as_view({'delete': 'delete'}), name='prediction-delete'),
    path('predict/batch/', views.PredictionViewSet.as_view({'post': 'batch'}), name='predict-batch'),
    path('what-if/', views.ExplanationViewSet.as_view({'post': 'what_if'}), name='what-if'),
    path('export/predictions/', views.ExportViewSet.as_view({'get': 'predictions'}), name='export-predictions'),
    path('admin/stats/', views.AdminViewSet.as_view({'get': 'stats'}), name='admin-stats'),
    path('admin/users/', views.AdminViewSet.as_view({'get': 'users'}), name='admin-users'),
    path('admin/users/<int:pk>/', views.AdminViewSet.as_view({'get': 'user_detail'}), name='admin-user-detail'),
    path('admin/model-info/', views.AdminViewSet.as_view({'get': 'model_info'}), name='admin-model-info'),
]