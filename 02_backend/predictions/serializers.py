# predictions/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    Prediction, UserHealthProfile, HealthTip,
    Goal, Medication, Symptom, Challenge
)

# ==================== USER SERIALIZER ====================
class UserSerializer(serializers.ModelSerializer):
    """Basic user information serializer"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


# ==================== PREDICTION INPUT SERIALIZER ====================
class PredictionInputSerializer(serializers.Serializer):
    """Serializer for prediction input data (21 features)"""
    HighBP = serializers.IntegerField(required=False, default=0, help_text="High blood pressure (0 or 1)")
    HighChol = serializers.IntegerField(required=False, default=0, help_text="High cholesterol (0 or 1)")
    CholCheck = serializers.IntegerField(required=False, default=1, help_text="Cholesterol check in past 5 years (0 or 1)")
    BMI = serializers.FloatField(required=False, default=25.0, help_text="Body Mass Index")
    Smoker = serializers.IntegerField(required=False, default=0, help_text="Smoker (0 or 1)")
    Stroke = serializers.IntegerField(required=False, default=0, help_text="Ever had a stroke (0 or 1)")
    HeartDiseaseorAttack = serializers.IntegerField(required=False, default=0, help_text="Heart disease or attack (0 or 1)")
    PhysActivity = serializers.IntegerField(required=False, default=1, help_text="Physical activity in past 30 days (0 or 1)")
    Fruits = serializers.IntegerField(required=False, default=1, help_text="Consume fruit 1+ times per day (0 or 1)")
    Veggies = serializers.IntegerField(required=False, default=1, help_text="Consume vegetables 1+ times per day (0 or 1)")
    HvyAlcoholConsump = serializers.IntegerField(required=False, default=0, help_text="Heavy alcohol consumption (0 or 1)")
    AnyHealthcare = serializers.IntegerField(required=False, default=1, help_text="Have any health insurance (0 or 1)")
    NoDocbcCost = serializers.IntegerField(required=False, default=0, help_text="Could not see doctor due to cost (0 or 1)")
    GenHlth = serializers.IntegerField(required=False, default=3, help_text="General health (1-5, 1=excellent, 5=poor)")
    MentHlth = serializers.IntegerField(required=False, default=0, help_text="Days of poor mental health in past 30 days")
    PhysHlth = serializers.IntegerField(required=False, default=0, help_text="Days of poor physical health in past 30 days")
    DiffWalk = serializers.IntegerField(required=False, default=0, help_text="Difficulty walking (0 or 1)")
    Sex = serializers.IntegerField(required=False, default=0, help_text="Sex (0=female, 1=male)")
    Age = serializers.IntegerField(required=False, default=45, help_text="Age category (1-13)")
    Education = serializers.IntegerField(required=False, default=4, help_text="Education level (1-6)")
    Income = serializers.IntegerField(required=False, default=5, help_text="Income category (1-8)")

    def validate(self, data):
        """Validate that at least some data is provided"""
        # Default values
        defaults = {
            'HighBP': 0, 'HighChol': 0, 'CholCheck': 1, 'BMI': 25.0,
            'Smoker': 0, 'Stroke': 0, 'HeartDiseaseorAttack': 0,
            'PhysActivity': 1, 'Fruits': 1, 'Veggies': 1,
            'HvyAlcoholConsump': 0, 'AnyHealthcare': 1, 'NoDocbcCost': 0,
            'GenHlth': 3, 'MentHlth': 0, 'PhysHlth': 0, 'DiffWalk': 0,
            'Sex': 0, 'Age': 45, 'Education': 4, 'Income': 5
        }
        
        # Check if any non-default values were provided
        has_data = False
        for key, value in data.items():
            if key in defaults and value != defaults[key]:
                has_data = True
                break
        
        if not has_data:
            raise serializers.ValidationError("At least one health parameter must be provided")
        
        # Validate ranges
        if data.get('BMI', 25) < 10 or data.get('BMI', 25) > 100:
            raise serializers.ValidationError({"BMI": "BMI must be between 10 and 100"})
        
        if data.get('Age', 45) < 18 or data.get('Age', 45) > 120:
            raise serializers.ValidationError({"Age": "Age must be between 18 and 120"})
        
        if data.get('GenHlth', 3) < 1 or data.get('GenHlth', 3) > 5:
            raise serializers.ValidationError({"GenHlth": "General health must be between 1 and 5"})
        
        if data.get('MentHlth', 0) < 0 or data.get('MentHlth', 0) > 30:
            raise serializers.ValidationError({"MentHlth": "Mental health days must be between 0 and 30"})
        
        if data.get('PhysHlth', 0) < 0 or data.get('PhysHlth', 0) > 30:
            raise serializers.ValidationError({"PhysHlth": "Physical health days must be between 0 and 30"})
        
        return data


# ==================== PREDICTION SERIALIZER ====================
class PredictionSerializer(serializers.ModelSerializer):
    """Serializer for Prediction model with XAI features"""

    username = serializers.CharField(source='user.username', read_only=True, default='Anonymous')
    risk_category_color = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()
    risk_score = serializers.SerializerMethodField()

    class Meta:
        model = Prediction
        fields = [
            'id',
            'username',
            'user',
            'patient_data',
            'result',
            'probability',
            'risk_score',
            'top_factors',
            'shap_values',
            'lime_explanation',
            'recommendations',
            'is_public',
            'feedback',
            'actual_outcome',
            'feedback_date',
            'created_at',
            'formatted_date',
            'risk_category_color'
        ]
        read_only_fields = ['id', 'created_at', 'shap_values', 'lime_explanation']  # Fixed: removed 'user' from read_only
        extra_kwargs = {
            'user': {'write_only': True}  # Keep user as write-only
        }

    def get_risk_category_color(self, obj):
        """Get color code for risk level"""
        if obj.result == 'HIGH':
            return '#e74c3c'  # Red
        elif obj.result == 'MODERATE':
            return '#f39c12'  # Orange
        else:
            return '#27ae60'  # Green

    def get_formatted_date(self, obj):
        """Return formatted date"""
        return obj.created_at.strftime("%Y-%m-%d %H:%M") if obj.created_at else None

    def get_risk_score(self, obj):
        """Calculate risk score from probability"""
        return obj.probability * 100 if obj.probability else 0


class PredictionDetailSerializer(PredictionSerializer):
    """Detailed serializer for Prediction with all fields"""
    
    class Meta(PredictionSerializer.Meta):
        fields = PredictionSerializer.Meta.fields
        read_only_fields = ['id', 'created_at']  # Fixed: removed 'user' from here too


# ==================== PREDICTION HISTORY SERIALIZER ====================
class PredictionHistorySerializer(serializers.ModelSerializer):
    """Serializer for prediction history (lighter version)"""
    risk_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Prediction
        fields = [
            'id',
            'result',
            'probability',
            'risk_score',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_risk_score(self, obj):
        """Calculate risk score from probability"""
        return obj.probability * 100 if obj.probability else 0


# ==================== USER HEALTH PROFILE SERIALIZER ====================
class UserHealthProfileSerializer(serializers.ModelSerializer):
    """Serializer for user health profile"""
    username = serializers.CharField(source='user.username', read_only=True)
    bmi = serializers.SerializerMethodField()
    profile_completion = serializers.SerializerMethodField()

    class Meta:
        model = UserHealthProfile
        fields = [
            'id',
            'username',
            'health_score',
            'streak_days',
            'points',
            'level',
            'last_active',
            'exercise_frequency',
            'diet_type',
            'smoking_status',
            'alcohol_consumption',
            'created_at',
            'updated_at',
            'bmi',
            'profile_completion'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'last_active']

    def get_bmi(self, obj):
        """Get BMI from user model"""
        return obj.user.get_bmi()

    def get_profile_completion(self, obj):
        """Calculate profile completion percentage"""
        return obj.user.get_profile_completion_percentage()


# ==================== HEALTH TIP SERIALIZER ====================
class HealthTipSerializer(serializers.ModelSerializer):
    """Serializer for health tips"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = HealthTip
        fields = [
            'id',
            'title',
            'content',
            'category',
            'category_display',
            'risk_level',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['created_at']


# ==================== GOAL SERIALIZER ====================
class GoalSerializer(serializers.ModelSerializer):
    """Serializer for health goals"""
    progress = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()
    goal_type_display = serializers.CharField(source='get_goal_type_display', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = [
            'id',
            'goal_type',
            'goal_type_display',
            'title',
            'description',
            'target_value',
            'current_value',
            'unit',
            'start_date',
            'end_date',
            'is_active',
            'is_completed',
            'completed_at',
            'points_reward',
            'created_at',
            'progress',
            'days_left',
            'status'
        ]
        read_only_fields = ['user', 'created_at', 'completed_at']

    def get_progress(self, obj):
        """Calculate progress percentage"""
        if obj.target_value and obj.target_value > 0:
            progress = (obj.current_value / obj.target_value) * 100
            return min(100, round(progress, 1))
        return 0

    def get_days_left(self, obj):
        """Calculate days remaining"""
        if obj.end_date and not obj.is_completed:
            remaining = (obj.end_date - timezone.now().date()).days
            return max(0, remaining)
        return None

    def get_status(self, obj):
        """Get goal status"""
        if obj.is_completed:
            return 'COMPLETED'
        elif obj.end_date and obj.end_date < timezone.now().date():
            return 'EXPIRED'
        elif obj.is_active:
            return 'ACTIVE'
        return 'INACTIVE'

    def validate(self, data):
        """Validate goal data"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date'
                })
        return data


# ==================== MEDICATION SERIALIZER ====================
class MedicationSerializer(serializers.ModelSerializer):
    """Serializer for medications"""
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    next_dose = serializers.SerializerMethodField()
    doses_today = serializers.SerializerMethodField()
    total_doses = serializers.SerializerMethodField()

    class Meta:
        model = Medication
        fields = [
            'id',
            'name',
            'dosage',
            'frequency',
            'frequency_display',
            'times',
            'start_date',
            'end_date',
            'is_active',
            'reminder_enabled',
            'taken_doses',
            'notes',
            'created_at',
            'next_dose',
            'doses_today',
            'total_doses'
        ]
        read_only_fields = ['user', 'created_at', 'taken_doses']

    def get_next_dose(self, obj):
        """Get next scheduled dose"""
        if obj.times and len(obj.times) > 0:
            return obj.times[0]
        return None

    def get_doses_today(self, obj):
        """Get number of doses taken today"""
        today = timezone.now().date().isoformat()
        doses_today = [d for d in obj.taken_doses if today in d]
        return len(doses_today)

    def get_total_doses(self, obj):
        """Get total doses taken"""
        return len(obj.taken_doses)

    def validate(self, data):
        """Validate medication data"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date'
                })
        return data


# ==================== SYMPTOM SERIALIZER ====================
class SymptomSerializer(serializers.ModelSerializer):
    """Serializer for symptoms"""
    symptom_type_display = serializers.CharField(source='get_symptom_type_display', read_only=True)
    formatted_datetime = serializers.SerializerMethodField()

    class Meta:
        model = Symptom
        fields = [
            'id',
            'symptom_type',
            'symptom_type_display',
            'severity',
            'date',
            'time',
            'notes',
            'created_at',
            'formatted_datetime'
        ]
        read_only_fields = ['user', 'created_at']

    def get_formatted_datetime(self, obj):
        """Return formatted datetime"""
        if obj.time:
            return f"{obj.date} {obj.time}"
        return str(obj.date)

    def validate_severity(self, value):
        """Validate severity"""
        if value < 1 or value > 10:
            raise serializers.ValidationError("Severity must be between 1 and 10")
        return value


# ==================== CHALLENGE SERIALIZER ====================
class ChallengeSerializer(serializers.ModelSerializer):
    """Serializer for challenges"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    participants_count = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    is_participating = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            'id',
            'title',
            'description',
            'goal_type',
            'target_value',
            'unit',
            'start_date',
            'end_date',
            'status',
            'status_display',
            'is_active',
            'created_at',
            'participants_count',
            'days_remaining',
            'progress',
            'is_participating'
        ]
        read_only_fields = ['created_at']

    def get_participants_count(self, obj):
        """Get number of participants"""
        return obj.participants.count()

    def get_days_remaining(self, obj):
        """Get days remaining"""
        if obj.end_date:
            remaining = (obj.end_date - timezone.now().date()).days
            return max(0, remaining)
        return None

    def get_progress(self, obj):
        """Get user's progress in challenge (requires context)"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # This would need a UserChallengeProgress model to track
            return None
        return None

    def get_is_participating(self, obj):
        """Check if current user is participating"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.participants.all()
        return False


# ==================== DASHBOARD SERIALIZER ====================
class DashboardSerializer(serializers.Serializer):
    """Serializer for dashboard data (not a model serializer)"""
    profile = UserHealthProfileSerializer()
    recent_predictions = PredictionSerializer(many=True)
    active_goals = GoalSerializer(many=True)
    today_medications = MedicationSerializer(many=True)
    recent_symptoms = SymptomSerializer(many=True)
    active_challenges = ChallengeSerializer(many=True)
    stats = serializers.DictField()


# ==================== SIMULATION REQUEST SERIALIZER ====================
class SimulationRequestSerializer(serializers.Serializer):
    """Serializer for what-if simulation requests"""
    base_data = PredictionInputSerializer(help_text="Original patient data")
    modifications = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
        help_text="List of modifications to apply"
    )


# ==================== FEEDBACK SERIALIZER ====================
class FeedbackSerializer(serializers.Serializer):
    """Serializer for user feedback"""
    feedback = serializers.ChoiceField(
        choices=['accurate', 'inaccurate', 'unsure'],
        required=True,
        help_text="Feedback on prediction accuracy"
    )
    notes = serializers.CharField(required=False, allow_blank=True, help_text="Additional notes")


# ==================== EXPORT SERIALIZER ====================
class ExportSerializer(serializers.Serializer):
    """Serializer for export requests"""
    format = serializers.ChoiceField(choices=['csv', 'json'], default='json')
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    include_input = serializers.BooleanField(default=True, help_text="Include input data in export")
    include_shap = serializers.BooleanField(default=False, help_text="Include SHAP values")

    def validate(self, data):
        """Validate date range"""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date'
                })
        return data