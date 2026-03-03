"""
Main API Views - All endpoint implementations
Handles predictions, explanations, and user data
"""

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db.models import Count, Avg, Q, Sum
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta
import pandas as pd
import numpy as np
import json
import uuid
import logging

# Local imports
from .serializers import (
    PredictionInputSerializer, PredictionHistorySerializer, PredictionDetailSerializer,
    UserDetailSerializer, UserListSerializer, ExportRequestSerializer,
    WhatIfRequestSerializer
)
from .permissions import CanExportData
from .pagination import StandardResultsSetPagination, HistoryPagination
from .filters import PredictionFilter
from .throttles import PredictionThrottle, BurstRateThrottle
from users.models import User
from predictions.models import Prediction
from ml_service.model_loader import model_loader

# XAI imports
import shap
import lime
from lime.lime_tabular import LimeTabularExplainer

# Set up logging
logger = logging.getLogger(__name__)


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_shap_explanation(data):
    """Generate SHAP explanation for a prediction"""
    try:
        # Prepare data
        df = pd.DataFrame([data])[model_loader.feature_names]
        scaled = model_loader.scaler.transform(df)
        
        # Get SHAP values based on model type
        if hasattr(model_loader.model, 'feature_importances_'):
            explainer = shap.TreeExplainer(model_loader.model)
            shap_values = explainer.shap_values(scaled)
        else:
            # Use KernelExplainer for non-tree models
            background = model_loader.scaler.transform(
                pd.DataFrame([data] * min(50, len(model_loader.feature_names)))[model_loader.feature_names]
            )
            explainer = shap.KernelExplainer(model_loader.model.predict_proba, background)
            shap_values = explainer.shap_values(scaled, nsamples=100)
        
        # Format for JSON
        if isinstance(shap_values, list):
            shap_vals = shap_values[1].tolist() if len(shap_values) > 1 else shap_values[0].tolist()
        else:
            shap_vals = shap_values.tolist()
        
        expected_value = explainer.expected_value
        if isinstance(expected_value, list):
            expected_value = expected_value[1] if len(expected_value) > 1 else expected_value[0]
        
        return {
            'values': shap_vals[0] if isinstance(shap_vals[0], list) else shap_vals,
            'features': model_loader.feature_names,
            'base_value': float(expected_value)
        }
    except Exception as e:
        logger.error(f"SHAP explanation error: {str(e)}")
        return {'error': str(e)}


def get_top_factors(shap_explanation):
    """Extract top factors from SHAP values"""
    if 'error' in shap_explanation or 'values' not in shap_explanation:
        return []
    
    values = shap_explanation['values']
    features = shap_explanation['features']
    
    # Pair features with values
    pairs = list(zip(features, values))
    
    # Sort by absolute value
    pairs.sort(key=lambda x: abs(x[1]), reverse=True)
    
    # Take top 5
    return [
        {
            'feature': f,
            'value': float(v),
            'impact': 'positive' if v > 0 else 'negative',
            'magnitude': abs(float(v))
        }
        for f, v in pairs[:5]
    ]


def validate_prediction_input(data):
    """Validate that all required fields are present"""
    required_fields = ['Age', 'Sex', 'BMI', 'HighBP', 'HighChol', 'GenHlth']
    missing = [field for field in required_fields if field not in data]
    if missing:
        return False, f"Missing required fields: {missing}"
    return True, None


# ============================================================================
# PUBLIC ENDPOINTS (No Auth Required)
# ============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Check API health status"""
    try:
        model_status = model_loader is not None
        db_status = True
        try:
            User.objects.count()
        except:
            db_status = False
            
        return Response({
            'status': 'healthy' if model_status and db_status else 'degraded',
            'timestamp': timezone.now(),
            'version': '1.0.0',
            'components': {
                'model': 'loaded' if model_status else 'error',
                'database': 'connected' if db_status else 'error',
                'api': 'running'
            },
            'features_count': len(model_loader.feature_names) if model_loader else 0,
            'threshold': model_loader.threshold if model_loader else None
        })
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': timezone.now()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root endpoint with available endpoints"""
    endpoints = {
        'name': 'Diabetes Risk Prediction API',
        'version': '1.0.0',
        'documentation': 'See /api/features/ for model information',
        '_links': {
            'self': {'href': '/api/', 'method': 'GET'},
            'health': {'href': '/api/health/', 'method': 'GET'},
            'features': {'href': '/api/features/', 'method': 'GET'},
            'auth': {
                'register': {'href': '/api/auth/register/', 'method': 'POST'},
                'login': {'href': '/api/auth/login/', 'method': 'POST'},
                'profile': {'href': '/api/auth/profile/', 'method': 'GET'}
            },
            'predictions': {
                'predict': {'href': '/api/predict/', 'method': 'POST'},
                'batch': {'href': '/api/predict/batch/', 'method': 'POST'},
                'history': {'href': '/api/history/', 'method': 'GET'},
                'stats': {'href': '/api/stats/', 'method': 'GET'}
            },
            'explanations': {
                'shap': {'href': '/api/explain/shap/', 'method': 'POST'},
                'lime': {'href': '/api/explain/lime/', 'method': 'POST'},
                'what_if': {'href': '/api/what-if/', 'method': 'POST'}
            },
            'export': {
                'predictions': {'href': '/api/export/predictions/', 'method': 'GET'}
            }
        }
    }
    
    # Add admin endpoints if user is admin
    if request.user.is_authenticated and request.user.is_staff:
        endpoints['_links']['admin'] = {
            'stats': {'href': '/api/admin/stats/', 'method': 'GET'},
            'users': {'href': '/api/admin/users/', 'method': 'GET'},
            'model_info': {'href': '/api/admin/model-info/', 'method': 'GET'}
        }
    
    return Response(endpoints)


@api_view(['GET'])
@permission_classes([AllowAny])
def feature_info(request):
    """Get information about all features"""
    # Feature descriptions
    feature_descriptions = {
        'Age': 'Age category (1=18-24, 2=25-29, 3=30-34, 4=35-39, 5=40-44, 6=45-49, 7=50-54, 8=55-59, 9=60-64, 10=65-69, 11=70-74, 12=75-79, 13=80+)',
        'Sex': 'Gender (0=Female, 1=Male)',
        'BMI': 'Body Mass Index (weight in kg / height in m²)',
        'HighBP': 'High blood pressure (True/False)',
        'HighChol': 'High cholesterol (True/False)',
        'Smoker': 'Smoked at least 100 cigarettes (True/False)',
        'Stroke': 'Ever had a stroke (True/False)',
        'HeartDiseaseorAttack': 'Coronary heart disease or heart attack (True/False)',
        'PhysActivity': 'Physical activity in past 30 days (True/False)',
        'Fruits': 'Consume fruit 1+ times per day (True/False)',
        'Veggies': 'Consume vegetables 1+ times per day (True/False)',
        'HvyAlcoholConsump': 'Heavy alcohol consumption (True/False)',
        'AnyHealthcare': 'Have health insurance (True/False)',
        'NoDocbcCost': 'Could not see doctor due to cost (True/False)',
        'GenHlth': 'General health (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor)',
        'MentHlth': 'Days of poor mental health in past 30 days',
        'PhysHlth': 'Days of poor physical health in past 30 days',
        'DiffWalk': 'Difficulty walking (True/False)',
        'Education': 'Education level (1=Never attended, 2=Grades 1-8, 3=Grades 9-11, 4=Grade 12/GED, 5=College 1-3 years, 6=College 4+ years)',
        'Income': 'Income category (1=<$10k, 2=$10-15k, 3=$15-20k, 4=$20-25k, 5=$25-35k, 6=$35-50k, 7=$50-75k, 8=>$75k)'
    }
    
    # Get feature importance from model
    if hasattr(model_loader.model, 'feature_importances_'):
        importance = model_loader.model.feature_importances_
    elif hasattr(model_loader.model, 'coef_'):
        importance = np.abs(model_loader.model.coef_).flatten()
    else:
        importance = [1/len(model_loader.feature_names)] * len(model_loader.feature_names)
    
    # Create feature list
    features = []
    for i, feature in enumerate(model_loader.feature_names):
        features.append({
            'name': feature,
            'description': feature_descriptions.get(feature, 'No description available'),
            'importance': float(importance[i]) if i < len(importance) else 0,
            'type': 'numerical' if feature in ['Age', 'BMI', 'MentHlth', 'PhysHlth'] else 'categorical',
            'range': {
                'min': 0,
                'max': 1 if feature not in ['Age', 'BMI', 'MentHlth', 'PhysHlth'] else 100
            }
        })
    
    # Sort by importance
    features.sort(key=lambda x: x['importance'], reverse=True)
    
    # Get model metadata
    metadata = getattr(model_loader, 'model_metadata', {})
    
    return Response({
        'total_features': len(features),
        'features': features[:20],  # Top 20 features
        'all_features': features,  # All features
        'model': {
            'type': type(model_loader.model).__name__,
            'threshold': model_loader.threshold,
            'version': metadata.get('model_version', '1.0')
        },
        'performance': {
            'recall': metadata.get('recall', 'N/A'),
            'auc': metadata.get('auc', 'N/A'),
            'precision': metadata.get('precision', 'N/A'),
            'f1': metadata.get('f1', 'N/A')
        }
    })


# ============================================================================
# AUTHENTICATION VIEWS (Proxy to users app)
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Get current authenticated user"""
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data)


# ============================================================================
# BATCH PREDICTION ENDPOINT
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([PredictionThrottle, BurstRateThrottle])
def batch_predict(request):
    """Predict diabetes risk for multiple patients at once"""
    try:
        data = request.data
        
        # Validate input
        if 'patients' not in data:
            return Response({
                'success': False,
                'error': 'Missing "patients" field'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        patients = data['patients']
        if not isinstance(patients, list):
            return Response({
                'success': False,
                'error': '"patients" must be a list'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if len(patients) > 100:
            return Response({
                'success': False,
                'error': 'Maximum 100 patients per batch'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        successful = 0
        failed = 0
        
        for i, patient in enumerate(patients):
            try:
                # Validate individual patient data
                is_valid, error_msg = validate_prediction_input(patient)
                if not is_valid:
                    raise ValueError(error_msg)
                
                # Make prediction using model loader
                prediction = model_loader.predict(patient)
                
                # Add patient index
                prediction['patient_index'] = i + 1
                results.append(prediction)
                
                # Save to database
                Prediction.objects.create(
                    user=request.user,
                    risk_score=prediction['probability'] * 100,
                    risk_level=prediction['risk_level'],
                    threshold_used=prediction['threshold_used'],
                    input_data=patient,
                    model_version='1.0'
                )
                
                successful += 1
                    
            except Exception as e:
                results.append({
                    'patient_index': i + 1,
                    'error': str(e)
                })
                failed += 1
                logger.error(f"Batch prediction error for patient {i+1}: {str(e)}")
        
        # Calculate summary
        high_risk = sum(1 for r in results if r.get('risk_level') == 'high')
        moderate_risk = sum(1 for r in results if r.get('risk_level') == 'moderate')
        low_risk = sum(1 for r in results if r.get('risk_level') == 'low')
        
        return Response({
            'success': True,
            'batch_id': str(uuid.uuid4()),
            'batch_name': data.get('name', f"Batch_{timezone.now().strftime('%Y%m%d_%H%M%S')}"),
            'total_patients': len(patients),
            'successful': successful,
            'failed': failed,
            'results': results,
            'summary': {
                'high_risk': high_risk,
                'moderate_risk': moderate_risk,
                'low_risk': low_risk
            },
            'timestamp': timezone.now()
        })
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# PREDICTION VIEWSET
# ============================================================================

class PredictionViewSet(viewsets.ViewSet):
    """Prediction endpoints"""
    permission_classes = [IsAuthenticated]
    throttle_classes = [PredictionThrottle, BurstRateThrottle]
    
    def create(self, request):
        """Make a single prediction"""
        # Validate input
        serializer = PredictionInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get validated data
            data = serializer.validated_data
            
            # Make prediction using model loader
            result = model_loader.predict(data)
            
            # Generate SHAP explanation
            shap_explanation = get_shap_explanation(data)
            
            # Get top factors
            top_factors = get_top_factors(shap_explanation) if 'error' not in shap_explanation else []
            
            # Save to database
            prediction = Prediction.objects.create(
                user=request.user,
                risk_score=result['probability'] * 100,
                risk_level=result['risk_level'],
                threshold_used=result['threshold_used'],
                input_data=data,
                shap_values=shap_explanation if 'error' not in shap_explanation else None,
                top_factors=top_factors,
                model_version='1.0'
            )
            
            # Prepare response
            response_data = {
                'success': True,
                'prediction': {
                    'risk_score': result['probability'] * 100,
                    'risk_level': result['risk_level'],
                    'probability': result['probability'],
                    'threshold': result['threshold_used'],
                    'prediction': result['prediction']
                },
                'explanation': {
                    'shap': shap_explanation if 'error' not in shap_explanation else None,
                    'top_factors': top_factors
                },
                'metadata': {
                    'id': prediction.id,
                    'created_at': prediction.prediction_date,
                    'model_version': '1.0'
                }
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def batch(self, request):
        """Batch prediction for multiple patients"""
        return batch_predict(request._request)
    
    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get user prediction history with filters"""
        predictions = Prediction.objects.filter(user=request.user)
        
        # Apply filters
        risk_level = request.query_params.get('risk_level')
        if risk_level:
            predictions = predictions.filter(risk_level=risk_level)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            predictions = predictions.filter(prediction_date__date__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            predictions = predictions.filter(prediction_date__date__lte=date_to)
        
        min_risk = request.query_params.get('min_risk')
        if min_risk:
            predictions = predictions.filter(risk_score__gte=float(min_risk))
        
        max_risk = request.query_params.get('max_risk')
        if max_risk:
            predictions = predictions.filter(risk_score__lte=float(max_risk))
        
        # Search in input data (JSON field)
        search = request.query_params.get('search')
        if search:
            predictions = predictions.filter(input_data__icontains=search)
        
        # Order by most recent first
        predictions = predictions.order_by('-prediction_date')
        
        # Paginate
        paginator = HistoryPagination()
        page = paginator.paginate_queryset(predictions, request)
        
        if page is not None:
            serializer = PredictionHistorySerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = PredictionHistorySerializer(predictions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user prediction statistics"""
        predictions = Prediction.objects.filter(user=request.user)
        
        total = predictions.count()
        if total == 0:
            return Response({
                'total_predictions': 0,
                'average_risk': 0,
                'highest_risk': 0,
                'lowest_risk': 0,
                'high_risk_count': 0,
                'moderate_risk_count': 0,
                'low_risk_count': 0,
                'first_prediction': None,
                'last_prediction': None,
                'risk_trend': []
            })
        
        # Basic stats
        high_count = predictions.filter(risk_level='high').count()
        moderate_count = predictions.filter(risk_level='moderate').count()
        low_count = predictions.filter(risk_level='low').count()
        
        avg_risk = predictions.aggregate(Avg('risk_score'))['risk_score__avg']
        highest = predictions.order_by('-risk_score').first()
        lowest = predictions.order_by('risk_score').first()
        
        # First and last
        first = predictions.earliest('prediction_date')
        last = predictions.latest('prediction_date')
        
        # Risk trend (last 10)
        recent = predictions.order_by('-prediction_date')[:10]
        trend = [
            {
                'date': p.prediction_date.strftime('%Y-%m-%d'),
                'risk_score': p.risk_score,
                'risk_level': p.risk_level
            }
            for p in recent
        ]
        
        # Monthly breakdown
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT strftime('%%Y-%%m', prediction_date) as month,
                       COUNT(*) as count,
                       AVG(risk_score) as avg_risk
                FROM predictions_prediction
                WHERE user_id = %s
                GROUP BY strftime('%%Y-%%m', prediction_date)
                ORDER BY month
            """, [request.user.id])
            monthly = [
                {'month': row[0], 'count': row[1], 'avg_risk': float(row[2]) if row[2] else 0}
                for row in cursor.fetchall()
            ]
        
        return Response({
            'total_predictions': total,
            'average_risk': round(avg_risk, 2) if avg_risk else 0,
            'highest_risk': highest.risk_score if highest else 0,
            'lowest_risk': lowest.risk_score if lowest else 0,
            'high_risk_count': high_count,
            'moderate_risk_count': moderate_count,
            'low_risk_count': low_count,
            'first_prediction': first.prediction_date,
            'last_prediction': last.prediction_date,
            'risk_trend': trend[::-1],  # Chronological order
            'monthly_breakdown': monthly
        })
    
    @action(detail=True, methods=['get'])
    def detail(self, request, pk=None):
        """Get single prediction details"""
        prediction = get_object_or_404(Prediction, pk=pk, user=request.user)
        serializer = PredictionDetailSerializer(prediction)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        """Delete a prediction"""
        prediction = get_object_or_404(Prediction, pk=pk, user=request.user)
        prediction.delete()
        return Response({'message': 'Prediction deleted'}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Submit feedback on prediction accuracy"""
        prediction = get_object_or_404(Prediction, pk=pk, user=request.user)
        feedback = request.data.get('feedback')
        notes = request.data.get('notes', '')
        
        if feedback in ['accurate', 'inaccurate', 'unsure']:
            prediction.user_feedback = feedback
            prediction.user_notes = notes
            prediction.save()
            return Response({'message': 'Feedback saved'})
        
        return Response({'error': 'Invalid feedback'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# EXPLANATION VIEWSET
# ============================================================================

class ExplanationViewSet(viewsets.ViewSet):
    """XAI explanation endpoints"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def shap(self, request):
        """Get SHAP explanation for custom data"""
        serializer = PredictionInputSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        explanation = get_shap_explanation(data)
        
        if 'error' in explanation:
            return Response(explanation, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Get prediction
        result = model_loader.predict(data)
        
        return Response({
            'feature_names': explanation['features'],
            'shap_values': explanation['values'],
            'base_value': explanation['base_value'],
            'prediction': result['probability'],
            'prediction_class': 'Diabetes' if result['prediction'] == 1 else 'No Diabetes'
        })
    
    @action(detail=False, methods=['post'])
    def lime(self, request):
        """Get LIME explanation"""
        serializer = PredictionInputSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            # Prepare training data for LIME
            X_train = pd.DataFrame([data] * 100)[model_loader.feature_names]
            
            # Create explainer
            explainer = LimeTabularExplainer(
                X_train.values,
                feature_names=model_loader.feature_names,
                class_names=['No Diabetes', 'Diabetes'],
                mode='classification',
                discretize_continuous=True,
                random_state=42
            )
            
            # Prepare instance
            df = pd.DataFrame([data])[model_loader.feature_names]
            scaled = model_loader.scaler.transform(df)
            
            # Get explanation
            exp = explainer.explain_instance(
                scaled[0],
                model_loader.model.predict_proba,
                num_features=10,
                top_labels=1
            )
            
            # Format response
            exp_list = exp.as_list(label=1)
            if exp_list:
                features, weights = zip(*exp_list)
            else:
                features, weights = [], []
            
            # Get prediction
            result = model_loader.predict(data)
            
            return Response({
                'feature_names': list(features),
                'feature_weights': list(weights),
                'prediction': result['probability'],
                'prediction_class': 'Diabetes' if result['prediction'] == 1 else 'No Diabetes',
                'confidence': max(result['probability'], 1 - result['probability'])
            })
            
        except Exception as e:
            logger.error(f"LIME explanation error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def what_if(self, request):
        """What-if analysis - see how changes affect risk"""
        serializer = WhatIfRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        base_data = data['base_data']
        modifications = data['modifications']
        
        # Original prediction
        original_result = model_loader.predict(base_data)
        
        # Modified prediction
        modified_data = base_data.copy()
        for key, value in modifications.items():
            if key in modified_data:
                modified_data[key] = value
        
        modified_result = model_loader.predict(modified_data)
        
        # Calculate impact per factor
        factor_impact = {}
        for factor, new_value in modifications.items():
            temp_data = base_data.copy()
            temp_data[factor] = new_value
            temp_result = model_loader.predict(temp_data)
            factor_impact[factor] = {
                'change': temp_result['probability'] - original_result['probability'],
                'percentage': (temp_result['probability'] - original_result['probability']) * 100,
                'old_value': base_data.get(factor),
                'new_value': new_value,
                'new_risk_level': temp_result['risk_level']
            }
        
        return Response({
            'original_risk': {
                'risk_score': original_result['probability'] * 100,
                'risk_level': original_result['risk_level'],
                'probability': original_result['probability']
            },
            'modified_risk': {
                'risk_score': modified_result['probability'] * 100,
                'risk_level': modified_result['risk_level'],
                'probability': modified_result['probability']
            },
            'change': modified_result['probability'] - original_result['probability'],
            'percentage_change': (modified_result['probability'] - original_result['probability']) * 100,
            'factor_impact': factor_impact
        })


# ============================================================================
# EXPORT VIEWSET
# ============================================================================

class ExportViewSet(viewsets.ViewSet):
    """Data export endpoints"""
    permission_classes = [IsAuthenticated, CanExportData]
    
    @action(detail=False, methods=['get'])
    def predictions(self, request):
        """Export predictions in various formats"""
        # Get parameters
        serializer = ExportRequestSerializer(data=request.query_params)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        params = serializer.validated_data
        format_type = params['format']
        date_from = params.get('date_from')
        date_to = params.get('date_to')
        include_input = params['include_input']
        include_shap = params['include_shap']
        
        # Get predictions
        predictions = Prediction.objects.filter(user=request.user).order_by('-prediction_date')
        
        if date_from:
            predictions = predictions.filter(prediction_date__date__gte=date_from)
        if date_to:
            predictions = predictions.filter(prediction_date__date__lte=date_to)
        
        # Convert to DataFrame
        data = []
        for p in predictions:
            row = {
                'id': p.id,
                'date': p.prediction_date.strftime('%Y-%m-%d %H:%M'),
                'risk_score': p.risk_score,
                'risk_level': p.risk_level,
                'threshold_used': p.threshold_used,
                'model_version': p.model_version
            }
            
            if include_input and p.input_data:
                for key, value in p.input_data.items():
                    row[f'input_{key}'] = value
            
            if include_shap and p.shap_values:
                row['shap_available'] = True
                if isinstance(p.shap_values, dict):
                    row['top_features'] = p.shap_values.get('features', [])[:3]
            
            data.append(row)
        
        df = pd.DataFrame(data)
        
        # Export based on format
        if format_type == 'csv':
            response = HttpResponse(content_type='text/csv')
            filename = f"predictions_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            df.to_csv(response, index=False)
            return response
        
        elif format_type == 'json':
            response = HttpResponse(content_type='application/json')
            filename = f"predictions_{timezone.now().strftime('%Y%m%d_%H%M%S')}.json"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response.write(df.to_json(orient='records', indent=2))
            return response
        
        elif format_type == 'excel':
            response = HttpResponse(
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            filename = f"predictions_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            df.to_excel(response, index=False, engine='openpyxl')
            return response
        
        return Response({'error': 'Unsupported format'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# ADMIN VIEWSET
# ============================================================================

class AdminViewSet(viewsets.ViewSet):
    """Admin-only endpoints"""
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """System-wide statistics"""
        # User stats
        total_users = User.objects.count()
        verified_users = User.objects.filter(is_verified=True).count()
        active_today = User.objects.filter(last_login__date=timezone.now().date()).count()
        active_7d = User.objects.filter(last_login__gte=timezone.now() - timedelta(days=7)).count()
        active_30d = User.objects.filter(last_login__gte=timezone.now() - timedelta(days=30)).count()
        
        new_users_today = User.objects.filter(date_joined__date=timezone.now().date()).count()
        new_users_7d = User.objects.filter(date_joined__gte=timezone.now() - timedelta(days=7)).count()
        
        # Prediction stats
        total_predictions = Prediction.objects.count()
        predictions_today = Prediction.objects.filter(prediction_date__date=timezone.now().date()).count()
        predictions_7d = Prediction.objects.filter(prediction_date__gte=timezone.now() - timedelta(days=7)).count()
        predictions_30d = Prediction.objects.filter(prediction_date__gte=timezone.now() - timedelta(days=30)).count()
        
        avg_risk = Prediction.objects.aggregate(Avg('risk_score'))['risk_score__avg']
        
        # Risk distribution
        risk_dist = Prediction.objects.values('risk_level').annotate(count=Count('id'))
        
        # Top users
        top_users = User.objects.annotate(
            pred_count=Count('predictions')
        ).order_by('-pred_count')[:10]
        
        top_users_data = [
            {
                'username': u.username,
                'email': u.email,
                'prediction_count': u.pred_count,
                'verified': u.is_verified,
                'joined': u.date_joined.strftime('%Y-%m-%d')
            }
            for u in top_users
        ]
        
        # Daily activity for last 30 days
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT date(prediction_date) as date,
                       COUNT(*) as count
                FROM predictions_prediction
                WHERE prediction_date >= %s
                GROUP BY date(prediction_date)
                ORDER BY date
            """, [timezone.now() - timedelta(days=30)])
            daily_activity = [
                {'date': row[0], 'count': row[1]}
                for row in cursor.fetchall()
            ]
        
        return Response({
            'users': {
                'total': total_users,
                'verified': verified_users,
                'verification_rate': round((verified_users / total_users * 100), 2) if total_users else 0,
                'active_today': active_today,
                'active_7d': active_7d,
                'active_30d': active_30d,
                'new_today': new_users_today,
                'new_7d': new_users_7d
            },
            'predictions': {
                'total': total_predictions,
                'today': predictions_today,
                'last_7d': predictions_7d,
                'last_30d': predictions_30d,
                'average_risk': round(avg_risk, 2) if avg_risk else 0
            },
            'risk_distribution': {
                item['risk_level']: item['count'] for item in risk_dist
            },
            'top_users': top_users_data,
            'daily_activity': daily_activity,
            'timestamp': timezone.now()
        })
    
    @action(detail=False, methods=['get'])
    def users(self, request):
        """List all users with filters"""
        users = User.objects.all().order_by('-date_joined')
        
        # Apply filters
        is_verified = request.query_params.get('is_verified')
        if is_verified:
            users = users.filter(is_verified=is_verified.lower() == 'true')
        
        is_active = request.query_params.get('is_active')
        if is_active:
            users = users.filter(is_active=is_active.lower() == 'true')
        
        search = request.query_params.get('search')
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Paginate
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(users, request)
        
        if page is not None:
            serializer = UserListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def user_detail(self, request, pk=None):
        """Get user details (admin only)"""
        user = get_object_or_404(User, pk=pk)
        serializer = UserDetailSerializer(user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def model_info(self, request):
        """Get ML model information"""
        metadata = getattr(model_loader, 'model_metadata', {})
        
        return Response({
            'model_type': type(model_loader.model).__name__,
            'features_count': len(model_loader.feature_names),
            'features': model_loader.feature_names,
            'threshold': model_loader.threshold,
            'model_metadata': metadata,
            'performance': {
                'recall': metadata.get('recall', 'N/A'),
                'auc': metadata.get('auc', 'N/A'),
                'precision': metadata.get('precision', 'N/A'),
                'f1': metadata.get('f1', 'N/A'),
                'accuracy': metadata.get('accuracy', 'N/A')
            },
            'training_info': {
                'date': metadata.get('training_date', 'N/A'),
                'samples': metadata.get('n_samples', 'N/A'),
                'features_original': metadata.get('n_original_features', 'N/A')
            }
        })
    
    @action(detail=False, methods=['post'])
    def test_prediction(self, request):
        """Test prediction with custom data (admin only)"""
        serializer = PredictionInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        result = model_loader.predict(data)
        
        return Response({
            'input': data,
            'prediction': result,
            'timestamp': timezone.now()
        })