# users/views.py
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from django.utils import timezone
from django.core.exceptions import ValidationError
import logging

from .models import User
from predictions.models import Prediction  
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
    """User registration endpoint - Auto-verifies users for development"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # AUTO-VERIFY USER FOR DEVELOPMENT - COMMENT OUT FOR PRODUCTION
            user.is_verified = True
            user.save()
            
            # Generate JWT tokens for auto-login
            refresh = RefreshToken.for_user(user)
            
            # Email is still sent but user is already verified
            email_sent = send_verification_email(user, request)
            
            response_data = {
                'user': UserProfileSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'User registered successfully!',
            }
            
            if not email_sent:
                response_data['warning'] = 'Failed to send verification email. Please contact support.'
                logger.warning(f"Failed to send verification email to {user.email}")
            
            logger.info(f"New user created and auto-verified: {user.username}")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint - Uses JWT tokens"""
    
    serializer = UserLoginSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # VERIFICATION CHECK DISABLED FOR DEVELOPMENT
        # Uncomment for production
        """
        if not user.is_verified:
            return Response({
                'message': 'Please verify your email before logging in.',
                'email': user.email
            }, status=status.HTTP_401_UNAUTHORIZED)
        """
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        logger.info(f"User {user.username} logged in successfully")
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    
    try:
        # Get the refresh token from request if provided
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                # Blacklist the refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as e:
                logger.error(f"Error blacklisting token: {str(e)}")
        
        # Log the logout
        username = request.user.username
        logout(request)
        logger.info(f"User {username} logged out successfully")
        
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
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
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        logger.info(f"User {request.user.username} updated profile")
        
        return Response({
            'message': 'Profile updated successfully',
            'user': UserProfileSerializer(instance).data
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request, token):
    """Verify user email address"""
    
    try:
        user = User.objects.get(email_verification_token=token)
        
        if user.is_verified:
            return Response({
                'message': 'Email already verified',
                'email': user.email
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify email
        user.is_verified = True
        user.email_verification_token = None
        user.save()
        
        # Send welcome email
        send_welcome_email(user)
        
        logger.info(f"User {user.username} verified email successfully")
        
        return Response({
            'message': 'Email verified successfully. You can now log in.',
            'email': user.email
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        logger.warning(f"Invalid email verification token attempted: {token}")
        return Response({
            'message': 'Invalid or expired verification token'
        }, status=status.HTTP_400_BAD_REQUEST)


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
                return Response({
                    'message': 'Email already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate new token and send email
            send_verification_email(user, request)
            logger.info(f"Resent verification email to {email}")
            
            return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal if email exists for security
            logger.info(f"Verification email requested for non-existent email: {email}")
            pass
    
    # Always return success to prevent email enumeration
    return Response({
        'message': 'If an account exists with this email, a verification link has been sent.'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    """Request password reset email"""
    
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Check if user is verified
            if not user.is_verified:
                return Response({
                    'message': 'Please verify your email first before resetting password.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Send password reset email
            send_password_reset_email(user, request)
            logger.info(f"Password reset email sent to {email}")
            
        except User.DoesNotExist:
            logger.info(f"Password reset requested for non-existent email: {email}")
            pass
        
        # Always return success
        return Response({
            'message': 'If an account exists with this email, you will receive a password reset link.'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request, token):
    """Confirm password reset with token"""
    
    try:
        user = User.objects.get(password_reset_token=token)
        
        # Check if token is valid
        if not user.is_password_reset_token_valid():
            logger.warning(f"Expired password reset token used for user {user.username}")
            return Response({
                'message': 'Password reset token has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.password_reset_token = None
            user.password_reset_token_created = None
            user.save()
            
            logger.info(f"Password reset successful for user {user.username}")
            
            return Response({
                'message': 'Password reset successful. You can now log in with your new password.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except User.DoesNotExist:
        logger.warning(f"Invalid password reset token attempted: {token}")
        return Response({
            'message': 'Invalid reset token'
        }, status=status.HTTP_400_BAD_REQUEST)


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
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        logger.info(f"User {user.username} changed password successfully")
        
        # Generate new JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Password changed successfully. Please use your new token.',
            'access': str(refresh.access_token),
            'refresh': str(refresh)
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
                return 'Normal weight'
            elif bmi < 30:
                return 'Overweight'
            else:
                return 'Obese'
        return None
    
    def get_bmi_health_advice(bmi):
        if not bmi:
            return "Complete your profile with height and weight to calculate BMI"
        if bmi < 18.5:
            return "You are underweight. Consider consulting a nutritionist."
        elif bmi < 25:
            return "You have a healthy weight. Keep up the good work!"
        elif bmi < 30:
            return "You are overweight. Regular exercise and balanced diet recommended."
        else:
            return "You are in the obese range. Please consult a healthcare provider."
    
    # Get total predictions using the correct import
    total_predictions = Prediction.objects.filter(user=user).count()
    
    data = {
        'username': user.username,
        'email': user.email,
        'full_name': user.get_full_name(),
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone_number': user.phone_number,
        'date_of_birth': user.date_of_birth,
        'height': user.height,
        'weight': user.weight,
        'member_since': user.created_at,
        'last_login': user.last_login,
        'email_verified': user.is_verified,
        'profile_complete': all([user.height, user.weight, user.date_of_birth]),
        'bmi': bmi,
        'bmi_category': get_bmi_category(bmi) if bmi else None,
        'bmi_advice': get_bmi_health_advice(bmi),
        'total_predictions': total_predictions,
    }
    
    return Response(data, status=status.HTTP_200_OK)


# Health check endpoint
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint for monitoring"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'service': 'Authentication Service'
    }, status=status.HTTP_200_OK)