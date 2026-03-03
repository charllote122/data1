# predictions/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Prediction, UserHealthProfile, HealthTip,
    Goal, Medication, Symptom, Challenge, Milestone
)

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'result', 'probability', 'created_at', 'risk_color']
    list_filter = ['result', 'is_public', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'shap_values', 'lime_explanation']
    
    def risk_color(self, obj):
        colors = {
            'LOW': 'green',
            'MODERATE': 'orange',
            'HIGH': 'red'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.result, 'black'),
            obj.result
        )
    risk_color.short_description = 'Risk Level'

@admin.register(UserHealthProfile)
class UserHealthProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'health_score', 'streak_days', 'points', 'level']
    search_fields = ['user__username']

@admin.register(HealthTip)
class HealthTipAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'risk_level', 'is_active']
    list_filter = ['category', 'risk_level', 'is_active']

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'goal_type', 'progress_percentage', 'is_completed']
    list_filter = ['goal_type', 'is_completed', 'is_active']
    
    def progress_percentage(self, obj):
        if obj.target_value:
            return f"{(obj.current_value/obj.target_value)*100:.1f}%"
        return "N/A"

@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'dosage', 'frequency', 'is_active']
    list_filter = ['frequency', 'is_active']

@admin.register(Symptom)
class SymptomAdmin(admin.ModelAdmin):
    list_display = ['user', 'symptom_type', 'severity', 'date']
    list_filter = ['symptom_type', 'severity']

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'start_date', 'end_date', 'participant_count']
    list_filter = ['status', 'is_active']
    
    def participant_count(self, obj):
        return obj.participants.count()

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ['user', 'milestone_type', 'title', 'achieved', 'achieved_date']
    list_filter = ['achieved', 'milestone_type']