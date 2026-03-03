 
# health/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import HealthProfile, UserMilestone, Milestone

User = get_user_model()

@receiver(post_save, sender=User)
def create_health_profile(sender, instance, created, **kwargs):
    """Create a health profile when a new user is created"""
    if created:
        HealthProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def check_profile_milestone(sender, instance, **kwargs):
    """Check if user has earned profile completion milestone"""
    try:
        profile = instance.health_profile_health
        # Check if profile is complete (has height, weight, etc.)
        if profile.height and profile.weight and profile.blood_type:
            milestone = Milestone.objects.filter(
                title='Profile Completed',
                is_active=True
            ).first()
            if milestone:
                UserMilestone.objects.get_or_create(
                    user=instance,
                    milestone=milestone
                )
    except HealthProfile.DoesNotExist:
        pass