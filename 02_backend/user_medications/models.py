from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Medication(models.Model):
    FREQUENCY_CHOICES = [
        ('once', 'Once daily'),
        ('twice', 'Twice daily'),
        ('three', 'Three times daily'),
        ('four', 'Four times daily'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_medications')
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    time_of_day = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"