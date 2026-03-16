# backend/ai/admin.py
from django.contrib import admin
from .models import ChatHistory, MealPlan, SymptomCheck, AITokenUsage

@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'model_used', 'tokens_used', 'created_at']
    list_filter = ['model_used', 'created_at']
    search_fields = ['user__email', 'message', 'response']
    readonly_fields = ['created_at']

@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_favorite', 'created_at']
    list_filter = ['is_favorite', 'created_at']
    search_fields = ['user__email']

@admin.register(SymptomCheck)
class SymptomCheckAdmin(admin.ModelAdmin):
    list_display = ['user', 'duration', 'model_used', 'created_at']
    list_filter = ['duration', 'model_used', 'created_at']
    search_fields = ['user__email', 'symptoms']

@admin.register(AITokenUsage)
class AITokenUsageAdmin(admin.ModelAdmin):
    list_display = ['user', 'feature', 'model', 'tokens', 'cost_estimate', 'created_at']
    list_filter = ['feature', 'model', 'created_at']
    search_fields = ['user__email']