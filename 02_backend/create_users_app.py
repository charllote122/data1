import os

# Create directories
os.makedirs('users/migrations', exist_ok=True)
os.makedirs('users/templates/emails', exist_ok=True)
os.makedirs('users/utils', exist_ok=True)

# Create __init__.py files
with open('users/__init__.py', 'w', encoding='utf-8') as f:
    f.write('# This file makes the users directory a Python package')

with open('users/migrations/__init__.py', 'w', encoding='utf-8') as f:
    f.write('# This file makes the migrations directory a Python package')

with open('users/utils/__init__.py', 'w', encoding='utf-8') as f:
    f.write('# This file makes the utils directory a Python package')

# Create models.py
models_content = '''from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class User(AbstractUser):
    # Personal information
    phone_number = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Health information (for BMI)
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    
    # Email verification fields
    is_verified = models.BooleanField(default=False)
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Password reset fields
    password_reset_token = models.UUIDField(null=True, blank=True, unique=True)
    password_reset_token_created = models.DateTimeField(null=True, blank=True)
    
    # Account status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
    
    def get_bmi(self):
        """Calculate BMI if height and weight are available"""
        if self.height and self.weight:
            height_in_m = self.height / 100
            return round(self.weight / (height_in_m ** 2), 2)
        return None
    
    def generate_email_verification_token(self):
        self.email_verification_token = uuid.uuid4()
        self.save()
        return self.email_verification_token
    
    def generate_password_reset_token(self):
        self.password_reset_token = uuid.uuid4()
        self.password_reset_token_created = timezone.now()
        self.save()
        return self.password_reset_token
    
    def is_password_reset_token_valid(self):
        if not self.password_reset_token_created:
            return False
        expiry_time = self.password_reset_token_created + timezone.timedelta(hours=24)
        return timezone.now() <= expiry_time
    
    class Meta:
        ordering = ['-date_joined']
'''

with open('users/models.py', 'w', encoding='utf-8') as f:
    f.write(models_content)

# Create admin.py
admin_content = '''from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_verified', 'is_active')
    list_filter = ('is_verified', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'date_of_birth', 'height', 'weight')}),
        ('Verification', {'fields': ('is_verified', 'email_verification_token')}),
        ('Password Reset', {'fields': ('password_reset_token', 'password_reset_token_created')}),
    )
    
    readonly_fields = ('email_verification_token', 'password_reset_token', 'password_reset_token_created')
'''

with open('users/admin.py', 'w', encoding='utf-8') as f:
    f.write(admin_content)

# Create apps.py
apps_content = '''from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    
    def ready(self):
        import users.signals
'''

with open('users/apps.py', 'w', encoding='utf-8') as f:
    f.write(apps_content)

# Create urls.py
urls_content = '''from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
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
]
'''

with open('users/urls.py', 'w', encoding='utf-8') as f:
    f.write(urls_content)

# Create email_utils.py
email_utils_content = '''from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user, request):
    """
    Send email verification link to user
    """
    try:
        token = user.generate_email_verification_token()
        verification_url = request.build_absolute_uri(
            reverse('verify-email', kwargs={'token': token})
        )
        
        context = {
            'user': user,
            'verification_url': verification_url,
            'site_name': 'Diabetes Prediction App',
        }
        
        html_message = render_to_string('emails/verify_email.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Verify Your Email Address',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Verification email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {str(e)}")
        return False


def send_password_reset_email(user, request):
    """
    Send password reset link to user
    """
    try:
        token = user.generate_password_reset_token()
        reset_url = request.build_absolute_uri(
            reverse('password-reset-confirm', kwargs={'token': token})
        )
        
        context = {
            'user': user,
            'reset_url': reset_url,
            'site_name': 'Diabetes Prediction App',
            'valid_hours': 24,
        }
        
        html_message = render_to_string('emails/password_reset.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Reset Your Password',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Password reset email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user.email}: {str(e)}")
        return False


def send_welcome_email(user):
    """
    Send welcome email after successful registration and verification
    """
    try:
        context = {
            'user': user,
            'site_name': 'Diabetes Prediction App',
        }
        
        html_message = render_to_string('emails/welcome_email.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject='Welcome to Diabetes Prediction App!',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Welcome email sent to {user.email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
        return False
'''

with open('users/utils/email_utils.py', 'w', encoding='utf-8') as f:
    f.write(email_utils_content)

# Create email templates (without emoji)
verify_email_content = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to {{ site_name }}!</h1>
    </div>
    <div class="content">
        <h2>Hello {{ user.username }}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
            <a href="{{ verification_url }}" class="button">Verify Email Address</a>
        </div>
        
        <p>If the button doesn't work, copy this link: {{ verification_url }}</p>
        <p>This link will expire in 24 hours.</p>
    </div>
    <div class="footer">
        <p>&copy; {% now "Y" %} {{ site_name }}. All rights reserved.</p>
    </div>
</body>
</html>'''

with open('users/templates/emails/verify_email.html', 'w', encoding='utf-8') as f:
    f.write(verify_email_content)

password_reset_content = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Password Reset Request</h1>
    </div>
    <div class="content">
        <h2>Hello {{ user.username }}!</h2>
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center;">
            <a href="{{ reset_url }}" class="button">Reset Password</a>
        </div>
        
        <p>Link: {{ reset_url }}</p>
        
        <div class="warning">
            This link will expire in {{ valid_hours }} hours.
        </div>
        
        <p>If you didn't request this, ignore this email.</p>
    </div>
    <div class="footer">
        <p>&copy; {% now "Y" %} {{ site_name }}. All rights reserved.</p>
    </div>
</body>
</html>'''

with open('users/templates/emails/password_reset.html', 'w', encoding='utf-8') as f:
    f.write(password_reset_content)

welcome_email_content = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .feature-box { background-color: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to {{ site_name }}!</h1>
    </div>
    <div class="content">
        <h2>Hi {{ user.username }}!</h2>
        <p>Your email has been verified. Your account is now active!</p>
        
        <div class="feature-box">
            <h3>Get Started</h3>
            <ul>
                <li>Complete your profile</li>
                <li>Track your BMI</li>
                <li>Use diabetes prediction</li>
            </ul>
        </div>
    </div>
    <div class="footer">
        <p>&copy; {% now "Y" %} {{ site_name }}. All rights reserved.</p>
    </div>
</body>
</html>'''

with open('users/templates/emails/welcome_email.html', 'w', encoding='utf-8') as f:
    f.write(welcome_email_content)

# Create views.py
views_content = '''from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout
from django.utils import timezone
import logging

from .models import User
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, UserUpdateSerializer,
    EmailVerificationSerializer, ResendVerificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ChangePasswordSerializer
)
from .utils.email_utils import (
    send_verification_email, send_password_reset_email,
    send_welcome_email
)

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            email_sent = send_verification_email(user, request)
            token, created = Token.objects.get_or_create(user=user)
            
            response_data = {
                'user': UserProfileSerializer(user).data,
                'token': token.key,
                'message': 'User registered successfully. Please verify your email.',
            }
            
            if not email_sent:
                response_data['warning'] = 'Failed to send verification email.'
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint with email verification check"""
    
    serializer = UserLoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        if not user.is_verified:
            return Response({
                'message': 'Please verify your email before logging in.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    
    try:
        request.user.auth_token.delete()
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except:
        return Response({'message': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveAPIView):
    """Get user profile"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProfileUpdateView(generics.UpdateAPIView):
    """Update user profile"""
    
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request, token):
    """Verify user email address"""
    
    try:
        user = User.objects.get(email_verification_token=token)
        
        if user.is_verified:
            return Response({'message': 'Email already verified'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_verified = True
        user.email_verification_token = None
        user.save()
        
        send_welcome_email(user)
        
        return Response({'message': 'Email verified successfully'}, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'message': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_verification_email(request):
    """Resend email verification link"""
    
    serializer = ResendVerificationSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_verified:
                return Response({'message': 'Email already verified'}, status=status.HTTP_400_BAD_REQUEST)
            
            send_verification_email(user, request)
            
        except User.DoesNotExist:
            pass
    
    return Response({'message': 'If an account exists, a verification link has been sent.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    """Request password reset email"""
    
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            send_password_reset_email(user, request)
        except User.DoesNotExist:
            pass
        
        return Response({'message': 'If an account exists, you will receive a password reset link.'}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request, token):
    """Confirm password reset with token"""
    
    try:
        user = User.objects.get(password_reset_token=token)
        
        if not user.is_password_reset_token_valid():
            return Response({'message': 'Password reset token has expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.password_reset_token = None
            user.password_reset_token_created = None
            user.save()
            
            Token.objects.filter(user=user).delete()
            
            return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        return Response({'message': 'Invalid reset token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password (when logged in)"""
    
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        Token.objects.filter(user=user).delete()
        new_token = Token.objects.create(user=user)
        
        return Response({
            'message': 'Password changed successfully',
            'token': new_token.key
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard(request):
    """User dashboard with stats"""
    
    user = request.user
    bmi = user.get_bmi()
    
    def get_bmi_category(bmi):
        if bmi:
            if bmi < 18.5:
                return 'Underweight'
            elif bmi < 25:
                return 'Normal'
            elif bmi < 30:
                return 'Overweight'
            else:
                return 'Obese'
        return None
    
    data = {
        'username': user.username,
        'email': user.email,
        'full_name': user.get_full_name(),
        'member_since': user.created_at,
        'email_verified': user.is_verified,
        'profile_complete': all([user.height, user.weight, user.date_of_birth]),
        'bmi': bmi,
        'bmi_category': get_bmi_category(bmi) if bmi else None,
    }
    
    return Response(data, status=status.HTTP_200_OK)
'''

with open('users/views.py', 'w', encoding='utf-8') as f:
    f.write(views_content)

print("✅ Users app created successfully!")
print("📁 Directory structure:")
print("   - users/")
print("   - users/migrations/")
print("   - users/templates/emails/")
print("   - users/utils/")
print("\n📄 Files created:")
print("   - users/__init__.py")
print("   - users/admin.py")
print("   - users/apps.py")
print("   - users/models.py")
print("   - users/urls.py")
print("   - users/views.py")
print("   - users/utils/__init__.py")
print("   - users/utils/email_utils.py")
print("   - users/templates/emails/verify_email.html")
print("   - users/templates/emails/password_reset.html")
print("   - users/templates/emails/welcome_email.html")