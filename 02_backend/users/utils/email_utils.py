from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user, request):
    """Send email verification link"""
    try:
        verification_url = f"{request.scheme}://{request.get_host()}/api/auth/verify-email/{user.email_verification_token}/"
        
        subject = 'Verify your email address'
        message = f'''
        Hello {user.username},
        
        Please verify your email address by clicking the link below:
        {verification_url}
        
        If you didn't create an account, you can ignore this email.
        
        Thank you,
        Diabetes Prediction App Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")
        return False


def send_password_reset_email(user, request):
    """Send password reset link"""
    try:
        # Generate reset token
        user.generate_password_reset_token()
        
        reset_url = f"{request.scheme}://{request.get_host()}/reset-password/{user.password_reset_token}/"
        
        subject = 'Reset your password'
        message = f'''
        Hello {user.username},
        
        You requested to reset your password. Click the link below:
        {reset_url}
        
        If you didn't request this, you can ignore this email.
        
        This link will expire in 24 hours.
        
        Thank you,
        Diabetes Prediction App Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email: {e}")
        return False


def send_welcome_email(user):
    """Send welcome email after verification"""
    try:
        subject = 'Welcome to Diabetes Prediction App!'
        message = f'''
        Hello {user.username},
        
        Welcome to Diabetes Prediction App! Your email has been successfully verified.
        
        You can now:
        - Get personalized diabetes risk predictions
        - Track your health metrics
        - Set health goals
        - Monitor your progress
        
        Get started by logging in and completing your health profile.
        
        Thank you for joining us!
        Diabetes Prediction App Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")
        return False