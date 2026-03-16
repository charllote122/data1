# backend/ai/models.py
from django.db import models
from django.conf import settings

class ChatHistory(models.Model):
    """Store chat history between users and AI"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_chats'
    )
    message = models.TextField()
    response = models.TextField()
    model_used = models.CharField(max_length=100, blank=True, default='')
    tokens_used = models.IntegerField(default=0)
    context = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"Chat with {self.user.email} at {self.created_at}"

class MealPlan(models.Model):
    """Store generated meal plans"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='meal_plans'
    )
    preferences = models.JSONField(default=dict, blank=True)
    meal_plan_data = models.JSONField(default=dict)
    model_used = models.CharField(max_length=100, blank=True, default='')
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Meal Plan for {self.user.email} on {self.created_at.date()}"

class SymptomCheck(models.Model):
    """Store symptom check history"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='symptom_checks'
    )
    symptoms = models.JSONField(default=list, blank=True)
    duration = models.CharField(max_length=50, blank=True, default='')
    analysis = models.TextField(blank=True, default='')
    disclaimer = models.TextField(blank=True, default='')
    model_used = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Symptom Check for {self.user.email} on {self.created_at.date()}"

class AITokenUsage(models.Model):
    """Track token usage for monitoring"""
    FEATURE_CHOICES = [
        ('chat', 'Chat'),
        ('meal_plan', 'Meal Plan'),
        ('symptom', 'Symptom Check'),
        ('tips', 'Health Tips'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='ai_token_usage'
    )
    feature = models.CharField(max_length=20, choices=FEATURE_CHOICES, default='chat')
    model = models.CharField(max_length=100, blank=True, default='')
    tokens = models.IntegerField(default=0)
    cost_estimate = models.DecimalField(max_digits=10, decimal_places=6, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['feature', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.feature} - {self.tokens} tokens"