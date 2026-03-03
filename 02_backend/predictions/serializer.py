from rest_framework import serializers
from .models import (
    Prediction, UserHealthProfile, HealthTip,
    Goal, Medication, Symptom, Challenge
)


class PredictionSerializer(serializers.ModelSerializer):
    """Serializer for Prediction model"""
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'user', 'patient_data', 'result', 'probability',
            'top_factors', 'shap_values', 'lime_explanation',
            'recommendations', 'is_public', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class PredictionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Prediction"""
    
    class Meta:
        model = Prediction
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class UserHealthProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserHealthProfile"""
    
    class Meta:
        model = UserHealthProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class HealthTipSerializer(serializers.ModelSerializer):
    """Serializer for HealthTip"""
    
    class Meta:
        model = HealthTip
        fields = '__all__'


class GoalSerializer(serializers.ModelSerializer):
    """Serializer for Goal"""
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'completed_at']


class MedicationSerializer(serializers.ModelSerializer):
    """Serializer for Medication"""
    
    class Meta:
        model = Medication
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class SymptomSerializer(serializers.ModelSerializer):
    """Serializer for Symptom"""
    
    class Meta:
        model = Symptom
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class ChallengeSerializer(serializers.ModelSerializer):
    """Serializer for Challenge"""
    
    class Meta:
        model = Challenge
        fields = '__all__'