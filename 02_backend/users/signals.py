from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """Handle user post-save signals"""
    if created:
        logger.info(f"New user created: {instance.username}")
