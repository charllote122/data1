from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Avg, Count, Q
from django.utils import timezone
from django.http import HttpResponse
import logging
import json
from datetime import timedelta

from .models import Prediction, UserHealthProfile, HealthTip, Goal, Medication, Symptom, Challenge
from .serializers import (
    PredictionSerializer, PredictionDetailSerializer, PredictionInputSerializer,
    PredictionHistorySerializer, UserHealthProfileSerializer, HealthTipSerializer,
    GoalSerializer, MedicationSerializer, SymptomSerializer, ChallengeSerializer,
    SimulationRequestSerializer, FeedbackSerializer, ExportSerializer
)
from .model_loader import model_loader
from .services.simulation import RiskSimulator
from .services.population_stats import population_stats
from .utils.notifications import send_risk_alert, send_reminder
from .utils.milestones import check_and_award_milestones

logger = logging.getLogger(__name__)

# ========== FEATURE INFO ENDPOINT ==========
@api_view(['GET'])
@permission_classes([AllowAny])
def feature_info(request):
    """Get information about features used in prediction"""
    # Get actual feature importance from model loader
    model_info = model_loader.get_model_info()
    top_features = model_info.get('top_features', [])
    
    feature_info = {
        'features': [
            {
                'name': 'HighBP',
                'description': 'High blood pressure (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.523,
                'unit': 'binary'
            },
            {
                'name': 'HighChol',
                'description': 'High cholesterol (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.319,
                'unit': 'binary'
            },
            {
                'name': 'BMI',
                'description': 'Body Mass Index',
                'min': 10,
                'max': 100,
                'importance': 0.293,
                'unit': 'kg/m²'
            },
            {
                'name': 'Smoker',
                'description': 'Smoked at least 100 cigarettes (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.138,
                'unit': 'binary'
            },
            {
                'name': 'Stroke',
                'description': 'Ever had a stroke (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.05,
                'unit': 'binary'
            },
            {
                'name': 'HeartDiseaseorAttack',
                'description': 'Heart disease or attack (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.05,
                'unit': 'binary'
            },
            {
                'name': 'PhysActivity',
                'description': 'Physical activity in past 30 days (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.107,
                'unit': 'binary'
            },
            {
                'name': 'Fruits',
                'description': 'Consume fruit 1+ times per day (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.138,
                'unit': 'binary'
            },
            {
                'name': 'Veggies',
                'description': 'Consume vegetables 1+ times per day (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.05,
                'unit': 'binary'
            },
            {
                'name': 'HvyAlcoholConsump',
                'description': 'Heavy alcohol consumption (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.05,
                'unit': 'binary'
            },
            {
                'name': 'AnyHealthcare',
                'description': 'Have any health insurance (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.05,
                'unit': 'binary'
            },
            {
                'name': 'NoDocbcCost',
                'description': 'Could not see doctor due to cost (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.05,
                'unit': 'binary'
            },
            {
                'name': 'GenHlth',
                'description': 'General health (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor)',
                'min': 1,
                'max': 5,
                'importance': 0.510,
                'unit': 'scale'
            },
            {
                'name': 'MentHlth',
                'description': 'Days of poor mental health in past 30 days',
                'min': 0,
                'max': 30,
                'importance': 0.05,
                'unit': 'days'
            },
            {
                'name': 'PhysHlth',
                'description': 'Days of poor physical health in past 30 days',
                'min': 0,
                'max': 30,
                'importance': 0.05,
                'unit': 'days'
            },
            {
                'name': 'DiffWalk',
                'description': 'Difficulty walking (0=No, 1=Yes)',
                'min': 0,
                'max': 1,
                'importance': 0.05,
                'unit': 'binary'
            },
            {
                'name': 'Sex',
                'description': 'Sex (0=Female, 1=Male)',
                'min': 0,
                'max': 1,
                'importance': 0.142,
                'unit': 'binary'
            },
            {
                'name': 'Age',
                'description': 'Age category (1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-44, 6=45-49, 7=50-54, 8=55-59, 9=60-64, 10=65-69, 11=70-74, 12=75-79, 13=80+)',
                'min': 1,
                'max': 13,
                'importance': 0.292,
                'unit': 'category'
            },
            {
                'name': 'Education',
                'description': 'Education level (1=Never attended, 2=Grades 1-8, 3=Grades 9-11, 4=Grade 12/GED, 5=College 1-3 years, 6=College 4+ years)',
                'min': 1,
                'max': 6,
                'importance': 0.108,
                'unit': 'level'
            },
            {
                'name': 'Income',
                'description': 'Income category (1=<$10k, 2=$10-15k, 3=$15-20k, 4=$20-25k, 5=$25-35k, 6=$35-50k, 7=$50-75k, 8=>$75k)',
                'min': 1,
                'max': 8,
                'importance': 0.05,
                'unit': 'category'
            }
        ],
        'model_info': {
            'name': model_info.get('model_name', 'Gradient Boosting'),
            'f1_score': model_info.get('f1_score', 0.8403),
            'roc_auc': model_info.get('roc_auc', 0.8174),
            'threshold': model_info.get('threshold', 0.341),
            'features_count': model_info.get('features_count', 21)
        },
        'total_features': 21
    }
    return Response(feature_info)


# ========== PREDICTION VIEWSET ==========
class PredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for Prediction model"""
    
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter queryset by user"""
        return Prediction.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'retrieve':
            return PredictionDetailSerializer
        elif self.action == 'my_predictions':
            return PredictionSerializer
        elif self.action == 'create':
            return PredictionInputSerializer
        return self.serializer_class
    
    def create(self, request, *args, **kwargs):
        """Create a new prediction (authenticated)"""
        # Use PredictionInputSerializer for input validation
        input_serializer = PredictionInputSerializer(data=request.data)
        
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get validated data
            data = input_serializer.validated_data
            
            # Make prediction using model loader
            result = model_loader.predict(data)
            
            # Create prediction object - removed risk_score as it doesn't exist in model
            prediction = Prediction.objects.create(
                user=request.user,
                patient_data=data,
                result=result['risk_level'].upper(),
                probability=result['probability'],
                top_factors=result.get('top_factors', []),
                recommendations=result.get('recommendations', []),
                is_public=False
            )
            
            # Check for milestones
            check_and_award_milestones(request.user)
            
            # Return response
            serializer = PredictionSerializer(prediction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Prediction creation error: {str(e)}")
            return Response(
                {'error': 'Prediction failed', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        """This method won't be called because we override create"""
        pass
    
    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def my_predictions(self, request):
        """Get user's predictions with filters"""
        queryset = self.get_queryset()
        
        # Apply filters
        days = request.query_params.get('days')
        if days:
            date_threshold = timezone.now() - timedelta(days=int(days))
            queryset = queryset.filter(created_at__gte=date_threshold)
        
        result = request.query_params.get('result')
        if result:
            queryset = queryset.filter(result=result.upper())
        
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['GET'], permission_classes=[IsAuthenticated])
    def explain(self, request, pk=None):
        """Get explanation for prediction (XAI)"""
        prediction = self.get_object()
        
        # Calculate risk score from probability for display purposes
        risk_score = prediction.probability * 100 if prediction.probability else 0
        
        # Get explanation from model loader
        explanation = {
            'prediction_id': prediction.id,
            'result': prediction.result,
            'probability': prediction.probability,
            'risk_score': risk_score,  # Calculated from probability
            'top_factors': prediction.top_factors if prediction.top_factors else [],
            'shap_values': prediction.shap_values if prediction.shap_values else [],
            'lime_explanation': prediction.lime_explanation if prediction.lime_explanation else [],
            'recommendations': prediction.recommendations if prediction.recommendations else []
        }
        
        return Response(explanation)
    
    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def feedback(self, request, pk=None):
        """Submit feedback on prediction accuracy"""
        prediction = self.get_object()
        serializer = FeedbackSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        prediction.feedback = serializer.validated_data['feedback']
        prediction.feedback_notes = serializer.validated_data.get('notes', '')
        prediction.feedback_date = timezone.now()
        prediction.save()
        
        return Response({'status': 'feedback received', 'feedback': prediction.feedback})
    
    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def trends(self, request):
        """Get prediction trends over time"""
        user = request.user
        predictions = Prediction.objects.filter(user=user).order_by('created_at')
        
        if not predictions.exists():
            return Response({'message': 'No predictions yet', 'data': []})
        
        # Calculate risk scores from probabilities
        risk_scores = [p.probability * 100 if p.probability else 0 for p in predictions]
        avg_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 0
        
        # Calculate trends
        trend_data = {
            'dates': [p.created_at.strftime('%Y-%m-%d') for p in predictions],
            'probabilities': [p.probability for p in predictions],
            'risk_scores': risk_scores,
            'results': [p.result for p in predictions],
            'avg_probability': float(predictions.aggregate(Avg('probability'))['probability__avg'] or 0),
            'avg_risk_score': avg_risk_score,
            'total_predictions': predictions.count(),
            'high_risk_count': predictions.filter(result='HIGH').count(),
            'moderate_risk_count': predictions.filter(result='MODERATE').count(),
            'low_risk_count': predictions.filter(result='LOW').count(),
        }
        
        return Response(trend_data)
    
    @action(detail=False, methods=['POST'], permission_classes=[IsAuthenticated])
    def simulate(self, request):
        """Run what-if simulations"""
        serializer = SimulationRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        simulator = RiskSimulator()
        base_data = serializer.validated_data['base_data']
        modifications = serializer.validated_data.get('modifications', [])
        
        results = simulator.run_simulations(base_data, modifications)
        return Response(results)
    
    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def dashboard(self, request):
        """Get full dashboard for authenticated user"""
        user = request.user
        
        # Get health profile
        profile, created = UserHealthProfile.objects.get_or_create(user=user)
        
        # Get recent predictions
        recent_predictions = Prediction.objects.filter(user=user).order_by('-created_at')[:5]
        
        # Get active goals
        active_goals = Goal.objects.filter(user=user, is_active=True)
        
        # Get today's medications
        today_meds = Medication.objects.filter(
            user=user,
            is_active=True
        ).exclude(
            end_date__lt=timezone.now().date()
        )
        
        # Get recent symptoms
        recent_symptoms = Symptom.objects.filter(user=user).order_by('-date')[:10]
        
        # Get active challenges
        active_challenges = Challenge.objects.filter(
            participants=user,
            status='ACTIVE'
        )
        
        # Calculate stats
        total_predictions = Prediction.objects.filter(user=user).count()
        high_risk_count = Prediction.objects.filter(user=user, result='HIGH').count()
        moderate_risk_count = Prediction.objects.filter(user=user, result='MODERATE').count()
        low_risk_count = Prediction.objects.filter(user=user, result='LOW').count()
        
        dashboard_data = {
            'profile': UserHealthProfileSerializer(profile).data,
            'recent_predictions': PredictionSerializer(recent_predictions, many=True).data,
            'active_goals': GoalSerializer(active_goals, many=True).data,
            'today_medications': MedicationSerializer(today_meds, many=True).data,
            'recent_symptoms': SymptomSerializer(recent_symptoms, many=True).data,
            'active_challenges': ChallengeSerializer(active_challenges, many=True).data,
            'stats': {
                'total_predictions': total_predictions,
                'high_risk_predictions': high_risk_count,
                'moderate_risk_predictions': moderate_risk_count,
                'low_risk_predictions': low_risk_count,
                'health_score': profile.health_score,
                'streak_days': profile.streak_days,
                'points': profile.points,
                'level': profile.level
            }
        }
        
        return Response(dashboard_data)


# ========== PUBLIC PREDICTION ENDPOINTS ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def public_predict(request):
    """Public prediction endpoint (rate limited)"""
    try:
        data = request.data
        
        # Validate input using PredictionInputSerializer
        serializer = PredictionInputSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get session ID from request or create new one
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key
        
        # Initialize session tracking
        if 'remaining_predictions' not in request.session:
            request.session['remaining_predictions'] = 5
        
        # Make prediction
        prediction_result = model_loader.predict(serializer.validated_data)
        
        # Add meta information
        response_data = {
            'prediction': prediction_result,
            'meta': {
                'session_id': session_id,
                'requires_signup': prediction_result.get('probability', 0) > 0.7,
                'remaining_attempts': request.session['remaining_predictions']
            }
        }
        
        # Decrement remaining attempts
        if request.session['remaining_predictions'] > 0:
            request.session['remaining_predictions'] -= 1
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Public prediction error: {str(e)}")
        return Response({
            'error': 'Prediction failed',
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_tips(request):
    """Get public health tips"""
    tips = HealthTip.objects.filter(is_active=True)[:5]
    serializer = HealthTipSerializer(tips, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_dashboard(request):
    """Public dashboard preview"""
    # Get public stats
    total_public_predictions = Prediction.objects.filter(is_public=True).count()
    avg_risk = Prediction.objects.filter(is_public=True).aggregate(Avg('probability'))['probability__avg']
    
    # Get population statistics
    pop_stats = population_stats.get_stats()
    
    return Response({
        'total_predictions': total_public_predictions,
        'average_risk': avg_risk,
        'population_stats': pop_stats,
        'tips': HealthTipSerializer(HealthTip.objects.filter(is_active=True)[:3], many=True).data,
        'model_info': {
            'name': 'Gradient Boosting',
            'f1_score': 0.8403,
            'features_count': 21
        }
    })


# ========== HEALTH PROFILE ENDPOINTS ==========
@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def health_profile(request):
    """Get or update user health profile"""
    user = request.user
    profile, created = UserHealthProfile.objects.get_or_create(user=user)
    
    if request.method == 'GET':
        serializer = UserHealthProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'POST' or request.method == 'PATCH':
        serializer = UserHealthProfileSerializer(
            profile, 
            data=request.data, 
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            
            # Check for milestones
            check_and_award_milestones(user)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_health_metrics(request):
    """Update specific health metrics"""
    user = request.user
    profile, created = UserHealthProfile.objects.get_or_create(user=user)
    
    # Update metrics
    metrics_data = request.data
    for key, value in metrics_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)
    
    profile.save()
    
    # Check for health-related milestones
    check_and_award_milestones(user)
    
    return Response({'status': 'metrics updated', 'profile': UserHealthProfileSerializer(profile).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health_history(request):
    """Get health metrics history"""
    user = request.user
    
    # Get prediction history for trends
    predictions = Prediction.objects.filter(user=user).order_by('-created_at')[:30]
    
    # Calculate risk scores from probabilities
    risk_scores = [p.probability * 100 if p.probability else 0 for p in predictions]
    
    history = {
        'dates': [p.created_at.strftime('%Y-%m-%d') for p in predictions],
        'probabilities': [p.probability for p in predictions],
        'risk_scores': risk_scores,
        'bmi_history': [p.patient_data.get('BMI') for p in predictions if p.patient_data and p.patient_data.get('BMI')],
        'glucose_history': [p.patient_data.get('glucose') for p in predictions if p.patient_data and p.patient_data.get('glucose')]
    }
    
    return Response(history)


# ========== GOALS ENDPOINTS ==========
class GoalViewSet(viewsets.ModelViewSet):
    """ViewSet for Goals"""
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        value = request.data.get('value')
        
        if value is None:
            return Response({'error': 'Value is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        goal.current_value = float(value)
        if goal.current_value >= goal.target_value:
            goal.is_completed = True
            goal.completed_at = timezone.now()
            
            # Award points
            profile, created = UserHealthProfile.objects.get_or_create(user=request.user)
            profile.points += goal.points_reward
            profile.save()
        
        goal.save()
        
        return Response({
            'status': 'progress updated',
            'goal': GoalSerializer(goal).data
        })


# ========== MEDICATIONS ENDPOINTS ==========
class MedicationViewSet(viewsets.ModelViewSet):
    """ViewSet for Medications"""
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Medication.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['POST'])
    def take_dose(self, request, pk=None):
        medication = self.get_object()
        
        # Log dose taken
        current_time = timezone.now().isoformat()
        if not medication.taken_doses:
            medication.taken_doses = []
        
        medication.taken_doses.append(current_time)
        medication.save()
        
        # Check if it's time for reminder
        if medication.reminder_enabled:
            send_reminder(request.user, f"Time to take {medication.name}")
        
        return Response({
            'status': 'dose logged',
            'taken_at': current_time,
            'total_doses_today': len([d for d in medication.taken_doses if timezone.now().date().isoformat() in d])
        })


# ========== SYMPTOMS ENDPOINTS ==========
class SymptomViewSet(viewsets.ModelViewSet):
    """ViewSet for Symptoms"""
    serializer_class = SymptomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Symptom.objects.filter(user=self.request.user).order_by('-date', '-time')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['GET'])
    def trends(self, request):
        """Get symptom trends"""
        days = int(request.query_params.get('days', 30))
        date_threshold = timezone.now() - timedelta(days=days)
        
        symptoms = self.get_queryset().filter(date__gte=date_threshold)
        
        # Group by symptom type
        trends_data = {}
        for symptom in symptoms:
            if symptom.symptom_type not in trends_data:
                trends_data[symptom.symptom_type] = []
            trends_data[symptom.symptom_type].append({
                'date': symptom.date.strftime('%Y-%m-%d'),
                'severity': symptom.severity
            })
        
        return Response(trends_data)


# ========== CHALLENGES ENDPOINTS ==========
class ChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Challenges"""
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Challenge.objects.filter(is_active=True).order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['POST'])
    def join(self, request, pk=None):
        challenge = self.get_object()
        user = request.user
        
        if user not in challenge.participants.all():
            challenge.participants.add(user)
            challenge.save()
            
            return Response({'status': 'joined challenge', 'challenge': ChallengeSerializer(challenge, context={'request': request}).data})
        
        return Response({'status': 'already joined'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['GET'])
    def my_challenges(self, request):
        """Get user's active challenges"""
        user = request.user
        challenges = Challenge.objects.filter(participants=user, status='ACTIVE')
        serializer = self.get_serializer(challenges, many=True)
        return Response(serializer.data)


# ========== ANALYTICS ENDPOINTS ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_summary(request):
    """Get analytics summary for user"""
    user = request.user
    
    # Calculate various analytics
    predictions = Prediction.objects.filter(user=user)
    total_predictions = predictions.count()
    
    if total_predictions == 0:
        return Response({
            'message': 'No data available',
            'total_predictions': 0
        })
    
    # Risk trends
    high_risk_count = predictions.filter(result='HIGH').count()
    moderate_risk_count = predictions.filter(result='MODERATE').count()
    low_risk_count = predictions.filter(result='LOW').count()
    
    # Average risk by month
    monthly_avg = predictions.filter(
        created_at__gte=timezone.now() - timedelta(days=30)
    ).aggregate(Avg('probability'))['probability__avg']
    
    # Most common risk factors
    all_factors = []
    for p in predictions:
        if p.top_factors:
            all_factors.extend([f['feature'] for f in p.top_factors[:3]])
    
    from collections import Counter
    common_factors = Counter(all_factors).most_common(5)
    
    return Response({
        'total_predictions': total_predictions,
        'risk_distribution': {
            'high': high_risk_count,
            'moderate': moderate_risk_count,
            'low': low_risk_count
        },
        'high_risk_percentage': (high_risk_count / total_predictions) * 100 if total_predictions > 0 else 0,
        'moderate_risk_percentage': (moderate_risk_count / total_predictions) * 100 if total_predictions > 0 else 0,
        'low_risk_percentage': (low_risk_count / total_predictions) * 100 if total_predictions > 0 else 0,
        'average_risk_30days': monthly_avg,
        'common_risk_factors': [{'factor': f, 'count': c} for f, c in common_factors],
        'trend_direction': 'increasing' if monthly_avg and monthly_avg > 0.5 else 'decreasing'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_data(request):
    """Export user data in various formats"""
    user = request.user
    serializer = ExportSerializer(data=request.query_params)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    format_type = serializer.validated_data['format']
    start_date = serializer.validated_data.get('start_date')
    end_date = serializer.validated_data.get('end_date')
    
    # Filter predictions by date range
    predictions_qs = Prediction.objects.filter(user=user)
    if start_date:
        predictions_qs = predictions_qs.filter(created_at__date__gte=start_date)
    if end_date:
        predictions_qs = predictions_qs.filter(created_at__date__lte=end_date)
    
    # Gather all user data
    data = {
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
        },
        'predictions': list(predictions_qs.values()),
        'health_profile': list(UserHealthProfile.objects.filter(user=user).values()),
        'goals': list(Goal.objects.filter(user=user).values()),
        'medications': list(Medication.objects.filter(user=user).values()),
        'symptoms': list(Symptom.objects.filter(user=user).values()),
        'export_date': timezone.now().isoformat()
    }
    
    if format_type == 'json':
        import json
        response = HttpResponse(json.dumps(data, default=str, indent=2), content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename={user.username}_data_{timezone.now().strftime("%Y%m%d")}.json'
        return response
    
    elif format_type == 'csv':
        import csv
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename={user.username}_predictions_{timezone.now().strftime("%Y%m%d")}.csv'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Result', 'Probability', 'Risk Score', 'Risk Factors'])
        
        for p in predictions_qs:
            # Calculate risk score from probability
            risk_score = p.probability * 100 if p.probability else 0
            writer.writerow([
                p.created_at.strftime('%Y-%m-%d %H:%M'),
                p.result,
                p.probability,
                risk_score,
                json.dumps(p.top_factors) if p.top_factors else ''
            ])
        
        return response
    
    return Response({'error': 'Invalid format'}, status=status.HTTP_400_BAD_REQUEST)