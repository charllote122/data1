# predictions/utils/milestones.py
from django.utils import timezone
from ..models import Milestone
import logging

logger = logging.getLogger(__name__)

def check_and_award_milestones(user):
    """Check and award milestones to user"""
    
    # Define milestone checks
    milestone_checks = [
        {
            'type': 'first_prediction',
            'title': 'First Risk Assessment',
            'description': 'Completed your first diabetes risk assessment',
            'icon': '🎯',
            'check': lambda u: u.predictions.count() >= 1
        },
        {
            'type': 'five_predictions',
            'title': 'Health Explorer',
            'description': 'Completed 5 risk assessments',
            'icon': '🔍',
            'check': lambda u: u.predictions.count() >= 5
        },
        {
            'type': 'ten_predictions',
            'title': 'Health Analyst',
            'description': 'Completed 10 risk assessments',
            'icon': '📊',
            'check': lambda u: u.predictions.count() >= 10
        },
        {
            'type': 'twenty_five_predictions',
            'title': 'Health Expert',
            'description': 'Completed 25 risk assessments',
            'icon': '🏆',
            'check': lambda u: u.predictions.count() >= 25
        },
        {
            'type': 'feedback_provided',
            'title': 'Helpful Feedback',
            'description': 'Provided feedback on a prediction',
            'icon': '💬',
            'check': lambda u: u.predictions.filter(feedback__isnull=False).exists()
        }
    ]
    
    awarded = []
    
    for milestone_def in milestone_checks:
        # Check if milestone exists
        milestone, created = Milestone.objects.get_or_create(
            user=user,
            milestone_type=milestone_def['type'],
            defaults={
                'title': milestone_def['title'],
                'description': milestone_def['description'],
                'icon': milestone_def['icon'],
                'achieved': False
            }
        )
        
        # Check if should be awarded
        if not milestone.achieved and milestone_def['check'](user):
            milestone.achieved = True
            milestone.achieved_date = timezone.now()
            milestone.save()
            
            # Award points to user
            profile = user.health_profile
            profile.points += 10
            profile.save()
            
            awarded.append(milestone)
            logger.info(f"🏆 Milestone awarded to {user.username}: {milestone.title}")
    
    return awarded