from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import HealthProfile, HealthGoal, FamilyHistory, Milestone, UserMilestone
from .serializers import (
    HealthProfileSerializer, HealthGoalSerializer, 
    FamilyHistorySerializer, MilestoneSerializer, UserMilestoneSerializer
)

class IsOwner(permissions.BasePermission):
    """Custom permission to only allow owners of an object to access it"""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class HealthProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user health profiles"""
    serializer_class = HealthProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return HealthProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update current user's health profile"""
        profile, created = HealthProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get comprehensive health dashboard data"""
        user = request.user
        
        # Get profile
        profile, _ = HealthProfile.objects.get_or_create(user=user)
        
        # Get goals
        goals = HealthGoal.objects.filter(user=user)
        active_goals = goals.filter(is_active=True, is_achieved=False)
        achieved_goals = goals.filter(is_achieved=True)
        
        # Get family history
        family_history = FamilyHistory.objects.filter(user=user)
        
        # Get milestones
        user_milestones = UserMilestone.objects.filter(user=user)
        all_milestones = Milestone.objects.filter(is_active=True).count()
        achieved_count = user_milestones.count()
        
        # Calculate profile completion
        profile_completion = 0
        if profile.height and profile.weight:
            profile_completion += 50
        if profile.blood_type:
            profile_completion += 25
        if profile.exercise_frequency:
            profile_completion += 25
        
        return Response({
            'profile': HealthProfileSerializer(profile).data,
            'goals': {
                'active': HealthGoalSerializer(active_goals, many=True).data,
                'achieved': HealthGoalSerializer(achieved_goals, many=True).data,
                'total': goals.count(),
                'achieved_count': achieved_goals.count(),
                'active_count': active_goals.count(),
            },
            'family_history': FamilyHistorySerializer(family_history, many=True).data,
            'milestones': {
                'achieved': UserMilestoneSerializer(user_milestones, many=True).data,
                'total': all_milestones,
                'progress': int((achieved_count / all_milestones) * 100) if all_milestones > 0 else 0,
            },
            'profile_completion': profile_completion,
        })

class HealthGoalViewSet(viewsets.ModelViewSet):
    """ViewSet for health goals"""
    serializer_class = HealthGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return HealthGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update goal progress"""
        goal = self.get_object()
        current_value = request.data.get('current_value')
        
        if current_value is not None:
            goal.current_value = float(current_value)
            
            # Check if goal is achieved
            if goal.current_value >= goal.target_value and not goal.is_achieved:
                goal.is_achieved = True
                from django.utils import timezone
                goal.achieved_date = timezone.now().date()
            
            goal.save()
            
            serializer = self.get_serializer(goal)
            return Response(serializer.data)
        
        return Response(
            {'error': 'current_value is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active goals"""
        goals = self.get_queryset().filter(is_active=True, is_achieved=False)
        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def achieved(self, request):
        """Get achieved goals"""
        goals = self.get_queryset().filter(is_achieved=True)
        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)

class FamilyHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for family medical history"""
    serializer_class = FamilyHistorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return FamilyHistory.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MilestoneViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for milestones (read-only)"""
    queryset = Milestone.objects.filter(is_active=True)
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def user_milestones(self, request):
        """Get user's earned milestones"""
        user_milestones = UserMilestone.objects.filter(user=request.user)
        serializer = UserMilestoneSerializer(user_milestones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get milestone statistics for user"""
        from django.db.models import Count
        
        total_milestones = Milestone.objects.filter(is_active=True).count()
        achieved = UserMilestone.objects.filter(user=request.user).count()
        
        # Group by type
        by_type = UserMilestone.objects.filter(user=request.user)\
            .values('milestone__milestone_type')\
            .annotate(count=Count('id'))
        
        return Response({
            'total_milestones': total_milestones,
            'achieved': achieved,
            'in_progress': total_milestones - achieved,
            'completion_rate': int((achieved / total_milestones) * 100) if total_milestones > 0 else 0,
            'by_type': {item['milestone__milestone_type']: item['count'] for item in by_type}
        })