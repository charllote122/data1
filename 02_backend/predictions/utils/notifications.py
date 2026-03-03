# predictions/utils/notifications.py
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

def send_risk_alert(user, prediction):
    """Send risk alert email to user"""
    try:
        if not user.email_notifications:
            return False
        
        subject = f'⚠️ Health Alert: Your Diabetes Risk Assessment'
        
        message = f'''
        Dear {user.username},
        
        Your recent diabetes risk assessment shows a {prediction.risk_level} risk level.
        
        Risk Level: {prediction.risk_level}
        Probability: {prediction.probability:.1%}
        Date: {prediction.created_at.strftime('%Y-%m-%d %H:%M')}
        
        Top Risk Factors:
        {chr(10).join([f'- {f["feature"]}: {f["value"]}' for f in prediction.top_factors[:3]])}
        
        Recommendations:
        {chr(10).join([f'- {r["title"]}: {r["description"]}' for r in prediction.recommendations])}
        
        Please consult with your healthcare provider for personalized advice.
        
        Stay healthy,
        Diabetes Prediction App Team
        '''
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        logger.info(f"Risk alert sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send risk alert: {str(e)}")
        return False


def send_reminder(user, message):
    """Send reminder to user"""
    try:
        if not user.email_notifications:
            return False
        
        subject = '🔔 Diabetes App Reminder'
        
        full_message = f'''
        Dear {user.username},
        
        {message}
        
        Stay on track with your health goals!
        
        Diabetes Prediction App Team
        '''
        
        send_mail(
            subject,
            full_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to send reminder: {str(e)}")
        return False