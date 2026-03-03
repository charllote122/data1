# predictions/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserHealthProfile, Milestone

User = get_user_model()

@receiver(post_save, sender=User)
def create_user_health_profile(sender, instance, created, **kwargs):
    """Create health profile when user is created"""
    if created:
        UserHealthProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def create_initial_milestones(sender, instance, created, **kwargs):
    """Create initial milestones for new user"""
    if created:
        milestone_types = [
            ('first_prediction', 'First Risk Assessment', 'Complete your first risk assessment', '🎯'),
            ('five_predictions', 'Health Explorer', 'Complete 5 risk assessments', '🔍'),
            ('ten_predictions', 'Health Analyst', 'Complete 10 risk assessments', '📊'),
        ]
        
        for m_type, title, desc, icon in milestone_types:
            Milestone.objects.get_or_create(
                user=instance,
                milestone_type=m_type,
                defaults={
                    'title': title,
                    'description': desc,
                    'icon': icon,
                    'achieved': False
                }
            )