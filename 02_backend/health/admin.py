 
# health/admin.py
from django.contrib import admin
from .models import HealthProfile, HealthGoal, FamilyHistory, Milestone, UserMilestone

@admin.register(HealthProfile)
class HealthProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'height', 'weight', 'blood_type', 'created_at']
    list_filter = ['blood_type', 'has_diabetes', 'has_hypertension']
    search_fields = ['user__username', 'user__email']

@admin.register(HealthGoal)
class HealthGoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'goal_type', 'target_value', 'current_value', 'is_achieved']
    list_filter = ['goal_type', 'is_achieved', 'is_active']
    search_fields = ['user__username', 'title']

@admin.register(FamilyHistory)
class FamilyHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'relationship', 'condition', 'age_at_diagnosis']
    list_filter = ['relationship', 'condition']
    search_fields = ['user__username', 'condition_details']

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'milestone_type', 'points', 'is_active']
    list_filter = ['milestone_type', 'is_active']
    search_fields = ['title']

@admin.register(UserMilestone)
class UserMilestoneAdmin(admin.ModelAdmin):
    list_display = ['user', 'milestone', 'achieved_date']
    list_filter = ['milestone__milestone_type']
    search_fields = ['user__username', 'milestone__title']