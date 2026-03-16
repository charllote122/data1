# backend/ai/serializers.py
from rest_framework import serializers
from .models import ChatHistory, MealPlan, SymptomCheck, AITokenUsage

class ChatHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatHistory
        fields = ['id', 'message', 'response', 'model_used', 'tokens_used', 'created_at']
        read_only_fields = ['id', 'created_at']

class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = ['id', 'preferences', 'meal_plan_data', 'model_used', 'is_favorite', 'created_at']
        read_only_fields = ['id', 'created_at']

class SymptomCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCheck
        fields = ['id', 'symptoms', 'duration', 'analysis', 'disclaimer', 'model_used', 'created_at']
        read_only_fields = ['id', 'created_at']

class AITokenUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AITokenUsage
        fields = ['feature', 'model', 'tokens', 'cost_estimate', 'created_at']
        read_only_fields = ['created_at']