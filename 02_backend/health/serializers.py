 
from rest_framework import serializers
from .models import HealthProfile, HealthGoal, FamilyHistory, Milestone, UserMilestone

class HealthProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = HealthProfile
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class HealthGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = HealthGoal
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_progress_percentage(self, obj):
        if obj.target_value > 0:
            return min(100, int((obj.current_value / obj.target_value) * 100))
        return 0

class FamilyHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyHistory
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = '__all__'

class UserMilestoneSerializer(serializers.ModelSerializer):
    milestone_details = MilestoneSerializer(source='milestone', read_only=True)
    
    class Meta:
        model = UserMilestone
        fields = '__all__'
        read_only_fields = ['user', 'achieved_date']