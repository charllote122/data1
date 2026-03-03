from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class HealthProfile(models.Model):
    """Extended health profile for users"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='health_profile_health'  # Changed to be unique
    )
    
    # Basic health metrics
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    blood_type = models.CharField(max_length=5, blank=True, choices=[
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ])
    
    # Medical conditions
    has_diabetes = models.BooleanField(default=False)
    has_hypertension = models.BooleanField(default=False)
    has_heart_disease = models.BooleanField(default=False)
    
    # Lifestyle
    smoker = models.BooleanField(default=False)
    alcohol_consumption = models.CharField(max_length=20, blank=True, choices=[
        ('none', 'None'),
        ('occasional', 'Occasional'),
        ('moderate', 'Moderate'),
        ('heavy', 'Heavy'),
    ])
    exercise_frequency = models.CharField(max_length=20, blank=True, choices=[
        ('none', 'None'),
        ('1-2', '1-2 times per week'),
        ('3-4', '3-4 times per week'),
        ('5+', '5+ times per week'),
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Health Profile for {self.user.username}"

class HealthGoal(models.Model):
    """User health goals"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='health_goals_health'  # Changed to be unique
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    GOAL_TYPES = [
        ('weight', 'Weight Goal'),
        ('exercise', 'Exercise Goal'),
        ('blood_sugar', 'Blood Sugar Goal'),
        ('bp', 'Blood Pressure Goal'),
        ('other', 'Other'),
    ]
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES, default='other')
    
    target_value = models.FloatField()
    current_value = models.FloatField(default=0)
    unit = models.CharField(max_length=20, default='units')
    
    start_date = models.DateField(auto_now_add=True)
    target_date = models.DateField(null=True, blank=True)
    achieved_date = models.DateField(null=True, blank=True)
    
    is_achieved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"

class FamilyHistory(models.Model):
    """Family medical history"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='family_history_health'  # Changed to be unique
    )
    
    RELATIONSHIP_CHOICES = [
        ('parent', 'Parent'),
        ('child', 'Child'),
        ('sibling', 'Sibling'),
        ('grandparent', 'Grandparent'),
        ('aunt_uncle', 'Aunt/Uncle'),
        ('cousin', 'Cousin'),
        ('other', 'Other'),
    ]
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    
    CONDITION_CHOICES = [
        ('diabetes', 'Diabetes'),
        ('hypertension', 'Hypertension'),
        ('heart_disease', 'Heart Disease'),
        ('stroke', 'Stroke'),
        ('cancer', 'Cancer'),
        ('kidney_disease', 'Kidney Disease'),
        ('thyroid', 'Thyroid Disorder'),
        ('other', 'Other'),
    ]
    condition = models.CharField(max_length=30, choices=CONDITION_CHOICES)
    condition_details = models.CharField(max_length=200, blank=True)
    
    age_at_diagnosis = models.IntegerField(null=True, blank=True)
    is_deceased = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Family histories"
    
    def __str__(self):
        return f"{self.relationship} with {self.condition} - {self.user.username}"

class Milestone(models.Model):
    """System-wide milestones"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    MILESTONE_TYPES = [
        ('prediction', 'Prediction Milestone'),
        ('profile', 'Profile Milestone'),
        ('goal', 'Goal Milestone'),
        ('activity', 'Activity Milestone'),
        ('achievement', 'Achievement'),
    ]
    milestone_type = models.CharField(max_length=20, choices=MILESTONE_TYPES)
    
    # Requirements
    required_predictions = models.IntegerField(default=0)
    required_goals = models.IntegerField(default=0)
    required_days_active = models.IntegerField(default=0)
    
    badge_icon = models.CharField(max_length=50, blank=True)
    points = models.IntegerField(default=10)
    
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

class UserMilestone(models.Model):
    """User's earned milestones"""
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='user_milestones_health'  # Changed to be unique
    )
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE)
    
    achieved_date = models.DateTimeField(auto_now_add=True)
    progress = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['user', 'milestone']
    
    def __str__(self):
        return f"{self.user.username} - {self.milestone.title}"