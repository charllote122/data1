"""
API Serializers - Handle data validation, transformation, and serialization
All input/output data formatting for the API endpoints
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from predictions.models import Prediction
from users.models import User
import json
from datetime import datetime

# ============================================================================
# USER SERIALIZERS
# ============================================================================

class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user information serializer with computed fields"""
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()
    prediction_count = serializers.SerializerMethodField()
    days_since_joined = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'age', 'height', 'weight', 'bmi',
            'is_verified', 'is_active', 'date_joined', 'last_login',
            'prediction_count', 'days_since_joined'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        """Get full name or fallback to username"""
        return obj.get_full_name() or obj.username
    
    def get_age(self, obj):
        """Calculate age from date of birth"""
        if obj.date_of_birth:
            today = datetime.now().date()
            return today.year - obj.date_of_birth.year - (
                (today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day)
            )
        return None
    
    def get_bmi(self, obj):
        """Calculate BMI from height and weight"""
        return obj.get_bmi()
    
    def get_prediction_count(self, obj):
        """Get total predictions made by user"""
        return obj.predictions.count()
    
    def get_days_since_joined(self, obj):
        """Calculate days since user joined"""
        return (datetime.now().date() - obj.date_joined.date()).days


class UserListSerializer(serializers.ModelSerializer):
    """Minimal user info for lists (admin use)"""
    prediction_count = serializers.IntegerField(source='predictions.count', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'is_verified', 'is_active', 'date_joined', 'prediction_count']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Update user profile with validation"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'height', 'weight'
        ]
    
    def validate_height(self, value):
        """Validate height is reasonable"""
        if value and (value < 50 or value > 300):
            raise serializers.ValidationError(
                f"Height {value}cm is invalid. Must be between 50cm and 300cm"
            )
        return value
    
    def validate_weight(self, value):
        """Validate weight is reasonable"""
        if value and (value < 20 or value > 500):
            raise serializers.ValidationError(
                f"Weight {value}kg is invalid. Must be between 20kg and 500kg"
            )
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        # If both height and weight provided, check BMI range
        if 'height' in data and 'weight' in data:
            height_m = data['height'] / 100
            bmi = data['weight'] / (height_m ** 2)
            if bmi < 10 or bmi > 100:
                raise serializers.ValidationError(
                    f"BMI {bmi:.1f} is outside valid range (10-100)"
                )
        return data


# ============================================================================
# PREDICTION INPUT SERIALIZER
# ============================================================================

class PredictionInputSerializer(serializers.Serializer):
    """
    Validate input data for diabetes risk prediction
    Matches BRFSS 2015 dataset features
    """
    
    # Demographics (4 features)
    Age = serializers.IntegerField(
        min_value=18, max_value=120, required=True,
        help_text="Age in years (18-120)"
    )
    Sex = serializers.ChoiceField(
        choices=[(0, 'Female'), (1, 'Male')], required=True,
        help_text="0=Female, 1=Male"
    )
    Education = serializers.IntegerField(
        min_value=1, max_value=6, required=False, default=4,
        help_text="Education level (1-6): 1=Never attended, 6=College graduate"
    )
    Income = serializers.IntegerField(
        min_value=1, max_value=8, required=False, default=5,
        help_text="Income category (1-8): 1=<$10k, 8=>$75k"
    )
    
    # Health status (3 features)
    GenHlth = serializers.IntegerField(
        min_value=1, max_value=5, required=True,
        help_text="General health: 1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor"
    )
    MentHlth = serializers.IntegerField(
        min_value=0, max_value=30, required=False, default=0,
        help_text="Days of poor mental health in past 30 days"
    )
    PhysHlth = serializers.IntegerField(
        min_value=0, max_value=30, required=False, default=0,
        help_text="Days of poor physical health in past 30 days"
    )
    
    # Chronic conditions (4 features)
    HighBP = serializers.BooleanField(
        required=True,
        help_text="High blood pressure (True/False)"
    )
    HighChol = serializers.BooleanField(
        required=True,
        help_text="High cholesterol (True/False)"
    )
    Stroke = serializers.BooleanField(
        required=False, default=False,
        help_text="Ever had a stroke (True/False)"
    )
    HeartDiseaseorAttack = serializers.BooleanField(
        required=False, default=False,
        help_text="Coronary heart disease or heart attack (True/False)"
    )
    
    # Lifestyle (5 features)
    BMI = serializers.FloatField(
        min_value=10, max_value=100, required=True,
        help_text="Body Mass Index (10-100)"
    )
    Smoker = serializers.BooleanField(
        required=False, default=False,
        help_text="Smoked at least 100 cigarettes (True/False)"
    )
    PhysActivity = serializers.BooleanField(
        required=False, default=True,
        help_text="Physical activity in past 30 days (True/False)"
    )
    Fruits = serializers.BooleanField(
        required=False, default=True,
        help_text="Consume fruit 1+ times per day (True/False)"
    )
    Veggies = serializers.BooleanField(
        required=False, default=True,
        help_text="Consume vegetables 1+ times per day (True/False)"
    )
    HvyAlcoholConsump = serializers.BooleanField(
        required=False, default=False,
        help_text="Heavy alcohol consumption (True/False)"
    )
    
    # Healthcare access (3 features)
    AnyHealthcare = serializers.BooleanField(
        required=False, default=True,
        help_text="Have any health insurance (True/False)"
    )
    NoDocbcCost = serializers.BooleanField(
        required=False, default=False,
        help_text="Could not see doctor due to cost (True/False)"
    )
    CholCheck = serializers.BooleanField(
        required=False, default=True,
        help_text="Cholesterol check in past 5 years (True/False)"
    )
    
    # Functional status (1 feature)
    DiffWalk = serializers.BooleanField(
        required=False, default=False,
        help_text="Difficulty walking (True/False)"
    )
    
    def validate_BMI(self, value):
        """Add BMI category warnings"""
        if value < 18.5:
            print(f"Note: BMI {value} is underweight (<18.5)")
        elif 25 <= value < 30:
            print(f"Note: BMI {value} is overweight (25-30)")
        elif value >= 30:
            print(f"Note: BMI {value} is obese (≥30)")
        return value
    
    def validate(self, data):
        """Cross-field validation rules"""
        
        # Rule 1: No healthcare and cost barrier can't both be true
        if not data.get('AnyHealthcare', True) and data.get('NoDocbcCost', False):
            raise serializers.ValidationError({
                'NoDocbcCost': "Cannot have NoDocbcCost=true when AnyHealthcare=false"
            })
        
        # Rule 2: If age < 30, certain conditions are unlikely
        if data.get('Age', 0) < 30:
            if data.get('Stroke', False):
                raise serializers.ValidationError({
                    'Stroke': "Stroke is unlikely for age < 30. Please verify."
                })
            if data.get('HeartDiseaseorAttack', False):
                raise serializers.ValidationError({
                    'HeartDiseaseorAttack': "Heart disease is unlikely for age < 30. Please verify."
                })
        
        return data


# ============================================================================
# PREDICTION OUTPUT SERIALIZERS
# ============================================================================

class PredictionOutputSerializer(serializers.Serializer):
    """Format prediction results for API response"""
    risk_score = serializers.FloatField(
        help_text="Risk percentage (0-100%)"
    )
    risk_level = serializers.CharField(
        help_text="Risk category: low/moderate/high"
    )
    probability = serializers.FloatField(
        help_text="Raw probability (0-1)"
    )
    threshold = serializers.FloatField(
        help_text="Decision threshold used"
    )
    prediction = serializers.IntegerField(
        help_text="Binary prediction: 0=No Diabetes, 1=Diabetes"
    )


class PredictionHistorySerializer(serializers.ModelSerializer):
    """Serializer for saved predictions"""
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'prediction_date', 'risk_score', 'risk_level',
            'threshold_used', 'input_data'
        ]
        read_only_fields = ['id', 'prediction_date']


class PredictionDetailSerializer(serializers.ModelSerializer):
    """Detailed prediction with explanations"""
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'prediction_date', 'risk_score', 'risk_level',
            'threshold_used', 'input_data', 'shap_values', 'top_factors'
        ]
        read_only_fields = ['id', 'prediction_date']


# ============================================================================
# EXPLANATION SERIALIZERS
# ============================================================================

class ShapExplanationSerializer(serializers.Serializer):
    """SHAP values for model explanation"""
    feature_names = serializers.ListField(
        child=serializers.CharField(),
        help_text="Names of features"
    )
    shap_values = serializers.ListField(
        child=serializers.FloatField(),
        help_text="SHAP values for each feature"
    )
    base_value = serializers.FloatField(
        help_text="Base value (expected prediction)"
    )
    prediction = serializers.FloatField(
        help_text="Actual prediction"
    )


class LimeExplanationSerializer(serializers.Serializer):
    """LIME explanation for local interpretability"""
    feature_names = serializers.ListField(
        child=serializers.CharField()
    )
    feature_weights = serializers.ListField(
        child=serializers.FloatField()
    )
    prediction = serializers.FloatField()
    confidence = serializers.FloatField()


class TopFactorSerializer(serializers.Serializer):
    """Single top factor explanation"""
    feature = serializers.CharField()
    value = serializers.FloatField()
    impact = serializers.ChoiceField(choices=['positive', 'negative'])
    magnitude = serializers.FloatField()


class TopFactorsSerializer(serializers.Serializer):
    """List of top factors"""
    factors = TopFactorSerializer(many=True)


# ============================================================================
# BATCH PREDICTION SERIALIZERS
# ============================================================================

class BatchPredictionRequestSerializer(serializers.Serializer):
    """Batch prediction request"""
    predictions = serializers.ListField(
        child=PredictionInputSerializer(),
        min_length=1,
        max_length=100,
        help_text="List of patient data objects (max 100)"
    )
    name = serializers.CharField(
        required=False,
        default="Batch Prediction",
        help_text="Name for this batch"
    )


class BatchResultSerializer(serializers.Serializer):
    """Single result in batch"""
    index = serializers.IntegerField()
    risk_score = serializers.FloatField()
    risk_level = serializers.CharField()
    probability = serializers.FloatField()
    error = serializers.CharField(required=False)


class BatchPredictionResponseSerializer(serializers.Serializer):
    """Batch prediction response"""
    batch_id = serializers.CharField()
    name = serializers.CharField()
    total = serializers.IntegerField()
    successful = serializers.IntegerField()
    failed = serializers.IntegerField()
    results = BatchResultSerializer(many=True)
    summary = serializers.DictField()
    created_at = serializers.DateTimeField()


# ============================================================================
# WHAT-IF ANALYSIS SERIALIZERS
# ============================================================================

class WhatIfRequestSerializer(serializers.Serializer):
    """What-if analysis request"""
    base_data = PredictionInputSerializer(
        help_text="Original patient data"
    )
    modifications = serializers.DictField(
        child=serializers.FloatField(),
        help_text="Fields to modify with new values (e.g., {'BMI': 25, 'Smoker': False})"
    )


class FactorImpactSerializer(serializers.Serializer):
    """Impact of modifying a single factor"""
    change = serializers.FloatField(
        help_text="Absolute change in probability"
    )
    percentage = serializers.FloatField(
        help_text="Percentage change"
    )
    old_value = serializers.FloatField()
    new_value = serializers.FloatField()


class WhatIfResultSerializer(serializers.Serializer):
    """What-if analysis result"""
    original_risk = PredictionOutputSerializer()
    modified_risk = PredictionOutputSerializer()
    change = serializers.FloatField(
        help_text="Absolute change in probability"
    )
    percentage_change = serializers.FloatField(
        help_text="Percentage change"
    )
    factor_impact = serializers.DictField(
        child=FactorImpactSerializer(),
        help_text="Impact per modified factor"
    )


# ============================================================================
# STATISTICS SERIALIZERS
# ============================================================================

class UserStatsSerializer(serializers.Serializer):
    """User prediction statistics"""
    total_predictions = serializers.IntegerField()
    average_risk = serializers.FloatField()
    highest_risk = serializers.FloatField()
    lowest_risk = serializers.FloatField()
    high_risk_count = serializers.IntegerField()
    moderate_risk_count = serializers.IntegerField()
    low_risk_count = serializers.IntegerField()
    first_prediction = serializers.DateTimeField(allow_null=True)
    last_prediction = serializers.DateTimeField(allow_null=True)
    risk_trend = serializers.ListField(
        child=serializers.DictField(),
        help_text="Last 10 predictions with dates"
    )


class SystemStatsSerializer(serializers.Serializer):
    """System-wide statistics (admin only)"""
    users = serializers.DictField(
        child=serializers.IntegerField()
    )
    predictions = serializers.DictField(
        child=serializers.IntegerField()
    )
    risk_distribution = serializers.DictField()
    top_users = serializers.ListField(
        child=serializers.DictField()
    )
    timestamp = serializers.DateTimeField()


# ============================================================================
# EXPORT SERIALIZERS
# ============================================================================

class ExportRequestSerializer(serializers.Serializer):
    """Export request parameters"""
    format = serializers.ChoiceField(
        choices=['csv', 'json', 'excel'],
        default='csv',
        help_text="Export format"
    )
    date_from = serializers.DateField(
        required=False,
        help_text="Start date (YYYY-MM-DD)"
    )
    date_to = serializers.DateField(
        required=False,
        help_text="End date (YYYY-MM-DD)"
    )
    include_input = serializers.BooleanField(
        default=True,
        help_text="Include input data in export"
    )
    include_shap = serializers.BooleanField(
        default=False,
        help_text="Include SHAP values (increases file size)"
    )


# ============================================================================
# FEATURE INFO SERIALIZERS
# ============================================================================

class FeatureInfoSerializer(serializers.Serializer):
    """Information about a single feature"""
    name = serializers.CharField()
    description = serializers.CharField()
    importance = serializers.FloatField()
    type = serializers.ChoiceField(choices=['numerical', 'categorical'])
    range = serializers.DictField(required=False)


class FeaturesResponseSerializer(serializers.Serializer):
    """Response for feature information"""
    total_features = serializers.IntegerField()
    features = FeatureInfoSerializer(many=True)
    model_type = serializers.CharField()
    threshold = serializers.FloatField()


# ============================================================================
# ERROR RESPONSE SERIALIZER
# ============================================================================

class ErrorResponseSerializer(serializers.Serializer):
    """Standard error response format"""
    success = serializers.BooleanField(default=False)
    error_code = serializers.CharField(
        help_text="Error code for debugging"
    )
    message = serializers.CharField(
        help_text="Human-readable error message"
    )
    details = serializers.DictField(
        required=False,
        help_text="Additional error details"
    )
    timestamp = serializers.DateTimeField(
        help_text="Error timestamp"
    )
