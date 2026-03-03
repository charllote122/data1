 
# health/management/commands/create_milestones.py
from django.core.management.base import BaseCommand
from health.models import Milestone

class Command(BaseCommand):
    help = 'Create default milestones'

    def handle(self, *args, **kwargs):
        milestones = [
            {
                'title': 'First Prediction',
                'description': 'Make your first diabetes risk prediction',
                'milestone_type': 'prediction',
                'required_predictions': 1,
                'points': 10,
                'badge_icon': '🔮'
            },
            {
                'title': 'Profile Completed',
                'description': 'Complete your health profile',
                'milestone_type': 'profile',
                'required_goals': 0,
                'points': 15,
                'badge_icon': '👤'
            },
            {
                'title': 'Goal Setter',
                'description': 'Create your first health goal',
                'milestone_type': 'goal',
                'required_goals': 1,
                'points': 20,
                'badge_icon': '🎯'
            },
            {
                'title': 'Week Warrior',
                'description': 'Active for 7 consecutive days',
                'milestone_type': 'activity',
                'required_days_active': 7,
                'points': 25,
                'badge_icon': '⚡'
            },
            {
                'title': 'Prediction Master',
                'description': 'Make 10 predictions',
                'milestone_type': 'prediction',
                'required_predictions': 10,
                'points': 50,
                'badge_icon': '🏆'
            },
            {
                'title': 'Health Champion',
                'description': 'Achieve 5 health goals',
                'milestone_type': 'achievement',
                'required_goals': 5,
                'points': 100,
                'badge_icon': '👑'
            },
        ]
        
        for milestone_data in milestones:
            milestone, created = Milestone.objects.get_or_create(
                title=milestone_data['title'],
                defaults=milestone_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created milestone: {milestone.title}'))
            else:
                self.stdout.write(f'Milestone already exists: {milestone.title}')