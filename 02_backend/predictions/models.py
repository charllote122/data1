from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import json


class Prediction(models.Model):
    """Model for storing predictions"""
    
    RISK_CHOICES = [
        ('LOW', 'Low Risk'),
        ('MODERATE', 'Moderate Risk'),
        ('HIGH', 'High Risk'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='predictions',
        null=True,
        blank=True
    )
    patient_data = models.JSONField(default=dict)
    result = models.CharField(max_length=10, choices=RISK_CHOICES)
    probability = models.FloatField()
    top_factors = models.JSONField(default=list)
    shap_values = models.JSONField(default=list, null=True, blank=True)
    lime_explanation = models.JSONField(default=list, null=True, blank=True)
    recommendations = models.JSONField(default=list, null=True, blank=True)
    is_public = models.BooleanField(default=False)
    feedback = models.JSONField(null=True, blank=True)
    actual_outcome = models.CharField(max_length=10, null=True, blank=True)
    feedback_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user or 'Anonymous'} - {self.result} - {self.created_at}"


class UserHealthProfile(models.Model):
    """Extended health profile for users"""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='health_profile'
    )
    health_score = models.FloatField(default=0)
    streak_days = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    last_active = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional health metrics
    exercise_frequency = models.CharField(max_length=20, blank=True)
    diet_type = models.CharField(max_length=50, blank=True)
    smoking_status = models.CharField(max_length=20, blank=True)
    alcohol_consumption = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Health Profile"


class HealthTip(models.Model):
    """Model for health tips"""
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=50)
    risk_level = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class Goal(models.Model):
    """User health goals"""
    
    GOAL_TYPES = [
        ('WEIGHT', 'Weight Loss'),
        ('EXERCISE', 'Exercise'),
        ('DIET', 'Diet'),
        ('GLUCOSE', 'Blood Glucose'),
        ('MEDICATION', 'Medication Adherence'),
        ('OTHER', 'Other'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='goals'
    )
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    target_value = models.FloatField()
    current_value = models.FloatField(default=0)
    unit = models.CharField(max_length=20)
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    points_reward = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Medication(models.Model):
    """User medications"""
    
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('TWICE_DAILY', 'Twice Daily'),
        ('WEEKLY', 'Weekly'),
        ('AS_NEEDED', 'As Needed'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medications'
    )
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    times = models.JSONField(default=list)  # List of times to take
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    reminder_enabled = models.BooleanField(default=True)
    taken_doses = models.JSONField(default=list)  # Log of taken doses
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"


class Symptom(models.Model):
    """User symptom tracking"""
    
    SYMPTOM_TYPES = [
        ('FATIGUE', 'Fatigue'),
        ('THIRST', 'Excessive Thirst'),
        ('URINATION', 'Frequent Urination'),
        ('BLURRY_VISION', 'Blurry Vision'),
        ('HEADACHE', 'Headache'),
        ('NAUSEA', 'Nausea'),
        ('OTHER', 'Other'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='symptoms'
    )
    symptom_type = models.CharField(max_length=20, choices=SYMPTOM_TYPES)
    severity = models.IntegerField(choices=[(i, i) for i in range(1, 11)])
    date = models.DateField(default=timezone.now)
    time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.user.username} - {self.symptom_type} - {self.severity}"


class Challenge(models.Model):
    """Community challenges"""
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('UPCOMING', 'Upcoming'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    goal_type = models.CharField(max_length=50)
    target_value = models.FloatField()
    unit = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='challenges',
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class Milestone(models.Model):
    """Milestone achievements for users"""
    
    MILESTONE_TYPES = [
        ('first_prediction', 'First Risk Assessment'),
        ('five_predictions', 'Health Explorer'),
        ('ten_predictions', 'Health Analyst'),
        ('twenty_five_predictions', 'Health Expert'),
        ('streak_week', 'Weekly Warrior'),
        ('risk_reduction_10', 'Risk Reducer'),
        ('risk_reduction_25', 'Health Champion'),
        ('feedback_provided', 'Helpful Feedback'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='milestones'
    )
    milestone_type = models.CharField(max_length=30, choices=MILESTONE_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=10, default='🎯')
    achieved = models.BooleanField(default=False)
    achieved_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-achieved_date', 'milestone_type']
        unique_together = ['user', 'milestone_type']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class FamilyHistory(models.Model):
    """Model for storing family health history"""
    
    RELATIONSHIP_CHOICES = [
        ('parent', 'Parent'),
        ('child', 'Child'),
        ('sibling', 'Sibling'),
        ('grandparent', 'Grandparent'),
        ('aunt', 'Aunt'),
        ('uncle', 'Uncle'),
        ('cousin', 'Cousin'),
    ]

    CONDITION_CHOICES = [
        ('diabetes_t1', 'Type 1 Diabetes'),
        ('diabetes_t2', 'Type 2 Diabetes'),
        ('gestational', 'Gestational Diabetes'),
        ('heart_disease', 'Heart Disease'),
        ('hypertension', 'Hypertension'),
        ('stroke', 'Stroke'),
        ('obesity', 'Obesity'),
        ('kidney_disease', 'Kidney Disease'),
    ]

    RISK_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='family_history'
    )
    relationship = models.CharField(max_length=20, choices=RELATIONSHIP_CHOICES)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    condition_label = models.CharField(max_length=100, blank=True, help_text="Custom condition name if not in choices")
    age_at_diagnosis = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(120)],
        help_text="Age when condition was diagnosed"
    )
    is_deceased = models.BooleanField(default=False)
    age_at_death = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(120)],
        help_text="Age at death (if deceased)"
    )
    notes = models.TextField(blank=True, help_text="Additional notes about this family member")
    genetic_testing = models.BooleanField(default=False, help_text="Has undergone genetic testing")
    genetic_markers = models.CharField(
        max_length=200, 
        blank=True,
        help_text="Genetic markers found (e.g., BRCA1, HLA-DR3/DR4)"
    )
    genetic_risk_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Calculated genetic risk score (0-100)"
    )
    risk = models.CharField(
        max_length=10, 
        choices=RISK_LEVEL_CHOICES, 
        default='low',
        help_text="Overall risk level based on condition"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'risk']),
            models.Index(fields=['user', 'condition']),
        ]
        verbose_name = "Family History"
        verbose_name_plural = "Family Histories"

    def __str__(self):
        return f"{self.user.username} - {self.get_relationship_display()} - {self.get_condition_display()}"

    def save(self, *args, **kwargs):
        """Auto-calculate genetic risk score if not provided"""
        if not self.genetic_risk_score:
            self.genetic_risk_score = self.calculate_genetic_risk()
        super().save(*args, **kwargs)

    def calculate_genetic_risk(self):
        """Calculate genetic risk score based on relationship and condition"""
        score = 0
        
        # Base risk from condition
        if self.risk == 'high':
            score += 40
        elif self.risk == 'moderate':
            score += 20
        
        # Relationship factor
        if self.relationship in ['parent', 'child', 'sibling']:
            score += 30
        elif self.relationship in ['grandparent']:
            score += 15
        
        # Age factor (earlier diagnosis = higher genetic component)
        if self.age_at_diagnosis and self.age_at_diagnosis < 40:
            score += 20
        elif self.age_at_diagnosis and self.age_at_diagnosis < 60:
            score += 10
        
        # Genetic testing confirmation
        if self.genetic_testing and self.genetic_markers:
            score += 25
        
        return min(100, score)

    def get_genetic_risk_category(self):
        """Get category based on genetic risk score"""
        if self.genetic_risk_score >= 70:
            return "High"
        elif self.genetic_risk_score >= 40:
            return "Moderate"
        elif self.genetic_risk_score > 0:
            return "Low"
        return "Not Calculated"

    def get_condition_display_with_details(self):
        """Get condition display with age if available"""
        base = self.get_condition_display()
        if self.age_at_diagnosis:
            return f"{base} (Age {self.age_at_diagnosis})"
        return base