from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # JWT endpoints - use built-in views
    path('token/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile-update'),
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # Email verification
    path('verify-email/<uuid:token>/', views.verify_email, name='verify-email'),
    path('resend-verification/', views.resend_verification_email, name='resend-verification'),
    
    # Password management
    path('password-reset/', views.password_reset_request, name='password-reset-request'),
    path('password-reset/<uuid:token>/', views.password_reset_confirm, name='password-reset-confirm'),
    path('change-password/', views.change_password, name='change-password'),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
]