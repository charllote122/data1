from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Symptom(models.Model):
    SEVERITY_CHOICES = [
        (1, 'Mild'),
        (2, 'Moderate'),
        (3, 'Severe'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_symptoms')
    name = models.CharField(max_length=100)
    severity = models.IntegerField(choices=SEVERITY_CHOICES)
    recorded_at = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"