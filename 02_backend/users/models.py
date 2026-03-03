# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
import uuid

class User(AbstractUser):
    """
    Custom User Model with additional fields for health tracking and authentication
    """
    
    # Personal information with validation
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in format: '+999999999'. Up to 15 digits allowed."
    )
    phone_number = models.CharField(
        max_length=15, 
        blank=True, 
        validators=[phone_regex],
        help_text="Contact phone number"
    )
    date_of_birth = models.DateField(
        null=True, 
        blank=True,
        help_text="Date of birth (YYYY-MM-DD)"
    )
    
    # Health information (for BMI and health tracking)
    height = models.FloatField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(50.0), MaxValueValidator(300.0)],
        help_text="Height in cm (50-300 cm)"
    )
    weight = models.FloatField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(20.0), MaxValueValidator(500.0)],
        help_text="Weight in kg (20-500 kg)"
    )
    
    # Additional health metrics (optional)
    blood_type = models.CharField(
        max_length=3,
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-'),
        ],
        blank=True,
        null=True,
        help_text="Blood type"
    )
    
    # Gender for more accurate health calculations
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('N', 'Prefer not to say')
    ]
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
        help_text="Gender"
    )
    
    # Email verification fields
    is_verified = models.BooleanField(
        default=False,
        help_text="Designates whether the user has verified their email address."
    )
    email_verification_token = models.UUIDField(
        default=uuid.uuid4, 
        editable=False, 
        unique=True,
        null=True,
        blank=True,
        help_text="Token for email verification"
    )
    email_verified_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Timestamp when email was verified"
    )
    
    # Password reset fields
    password_reset_token = models.UUIDField(
        null=True, 
        blank=True, 
        unique=True,
        help_text="Token for password reset"
    )
    password_reset_token_created = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Timestamp when password reset token was created"
    )
    
    # Account status and timestamps
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether this user should be treated as active."
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when user was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when user was last updated"
    )
    last_password_change = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Timestamp of last password change"
    )
    
    # Privacy settings
    email_notifications = models.BooleanField(
        default=True,
        help_text="User wants to receive email notifications"
    )
    
    class Meta:
        ordering = ['-date_joined']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_verified']),
            models.Index(fields=['date_joined']),
        ]

    def __str__(self):
        return self.get_full_name() or self.username

    def get_full_name(self):
        """Return full name with proper formatting"""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username

    def get_short_name(self):
        """Return short name for display"""
        return self.first_name or self.username

    # BMI and Health Calculations
    def get_bmi(self):
        """Calculate BMI if height and weight are available"""
        if self.height and self.weight:
            try:
                height_in_m = self.height / 100
                bmi = self.weight / (height_in_m ** 2)
                return round(bmi, 2)
            except (ZeroDivisionError, TypeError):
                return None
        return None

    def get_bmi_category(self):
        """Get BMI category"""
        bmi = self.get_bmi()
        if not bmi:
            return None
        
        if bmi < 18.5:
            return 'Underweight'
        elif bmi < 25:
            return 'Normal weight'
        elif bmi < 30:
            return 'Overweight'
        else:
            return 'Obese'

    def get_ideal_weight_range(self):
        """Calculate ideal weight range based on height (using BMI 18.5-24.9)"""
        if not self.height:
            return None
        
        height_in_m = self.height / 100
        min_weight = round(18.5 * (height_in_m ** 2), 1)
        max_weight = round(24.9 * (height_in_m ** 2), 1)
        
        return {'min': min_weight, 'max': max_weight}

    # Email Verification Methods
    def generate_email_verification_token(self):
        """Generate new email verification token"""
        self.email_verification_token = uuid.uuid4()
        self.save(update_fields=['email_verification_token'])
        return self.email_verification_token

    def verify_email(self):
        """Mark email as verified"""
        if not self.is_verified:
            self.is_verified = True
            self.email_verified_at = timezone.now()
            self.email_verification_token = None  # Clear token after use
            self.save(update_fields=['is_verified', 'email_verified_at', 'email_verification_token'])
            return True
        return False

    # Password Reset Methods
    def generate_password_reset_token(self):
        """Generate new password reset token"""
        self.password_reset_token = uuid.uuid4()
        self.password_reset_token_created = timezone.now()
        self.save(update_fields=['password_reset_token', 'password_reset_token_created'])
        return self.password_reset_token

    def is_password_reset_token_valid(self):
        """Check if password reset token is still valid (24 hours)"""
        if not self.password_reset_token_created:
            return False
        expiry_time = self.password_reset_token_created + timezone.timedelta(hours=24)
        return timezone.now() <= expiry_time

    def reset_password(self, new_password):
        """Reset user password and clear reset token"""
        self.set_password(new_password)
        self.password_reset_token = None
        self.password_reset_token_created = None
        self.last_password_change = timezone.now()
        self.save(update_fields=['password', 'password_reset_token', 
                                'password_reset_token_created', 'last_password_change'])

    def change_password(self, old_password, new_password):
        """Change password with old password verification"""
        if not self.check_password(old_password):
            return False
        self.set_password(new_password)
        self.last_password_change = timezone.now()
        self.save(update_fields=['password', 'last_password_change'])
        return True

    # Account Management Methods
    def deactivate_account(self):
        """Deactivate user account"""
        self.is_active = False
        self.save(update_fields=['is_active'])

    def activate_account(self):
        """Activate user account"""
        self.is_active = True
        self.save(update_fields=['is_active'])

    def get_age(self):
        """Calculate age from date of birth"""
        if self.date_of_birth:
            today = timezone.now().date()
            age = today.year - self.date_of_birth.year
            # Adjust if birthday hasn't occurred this year
            if today.month < self.date_of_birth.month or \
               (today.month == self.date_of_birth.month and today.day < self.date_of_birth.day):
                age -= 1
            return age
        return None

    def get_profile_completion_percentage(self):
        """Calculate profile completion percentage"""
        fields_to_check = [
            self.first_name, self.last_name, self.phone_number,
            self.date_of_birth, self.height, self.weight, self.gender
        ]
        completed = sum(1 for field in fields_to_check if field)
        return int((completed / len(fields_to_check)) * 100)

    def get_health_summary(self):
        """Get comprehensive health summary"""
        return {
            'bmi': self.get_bmi(),
            'bmi_category': self.get_bmi_category(),
            'ideal_weight_range': self.get_ideal_weight_range(),
            'age': self.get_age(),
            'blood_type': self.blood_type,
            'gender': self.get_gender_display() if self.gender else None,
        }

    # Utility Methods
    def has_completed_profile(self):
        """Check if user has completed essential profile information"""
        required_fields = [self.first_name, self.last_name, self.date_of_birth]
        return all(required_fields)

    @classmethod
    def get_verified_users(cls):
        """Get all verified users"""
        return cls.objects.filter(is_verified=True)

    @classmethod
    def get_unverified_users(cls):
        """Get all unverified users"""
        return cls.objects.filter(is_verified=False)

    @classmethod
    def get_active_users(cls):
        """Get all active users"""
        return cls.objects.filter(is_active=True)

    def save(self, *args, **kwargs):
        """Override save to ensure email is lowercase"""
        self.email = self.email.lower() if self.email else self.email
        super().save(*args, **kwargs)