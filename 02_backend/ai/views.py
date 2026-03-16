# backend/ai/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import openrouter_service
from .models import ChatHistory, MealPlan, SymptomCheck, AITokenUsage
from .serializers import ChatHistorySerializer, MealPlanSerializer, SymptomCheckSerializer
from predictions.models import UserHealthProfile
import logging

logger = logging.getLogger(__name__)

class ChatView(APIView):
    """Handle chat interactions with AI"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        message = request.data.get('message')
        
        if not message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get user's health profile
            health_profile = UserHealthProfile.objects.filter(user=request.user).first()
            
            # Build system prompt with user context
            system_prompt = f"""You are an AI Health Coach specializing in diabetes prevention.
            User: {request.user.email}
            
            Provide helpful, accurate information about diabetes prevention and management.
            Always include appropriate disclaimers and encourage consulting healthcare professionals.
            """
            
            if health_profile:
                system_prompt += f"""
                User Health Profile:
                - Health Score: {health_profile.health_score if health_profile.health_score else 'Unknown'}/100
                - Streak Days: {health_profile.streak_days if health_profile.streak_days else 0}
                - Points: {health_profile.points if health_profile.points else 0}
                - Level: {health_profile.level if health_profile.level else 'Unknown'}
                - Exercise Frequency: {health_profile.exercise_frequency if health_profile.exercise_frequency else 'Unknown'}
                - Diet Type: {health_profile.diet_type if health_profile.diet_type else 'Unknown'}
                - Smoking Status: {health_profile.smoking_status if health_profile.smoking_status else 'Unknown'}
                - Alcohol Consumption: {health_profile.alcohol_consumption if health_profile.alcohol_consumption else 'Unknown'}
                - Last Active: {health_profile.last_active.strftime('%Y-%m-%d') if health_profile.last_active else 'Unknown'}
                """
            
            # Call OpenRouter service
            response = openrouter_service.chat_completion(
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': message}
                ],
                user=request.user,
                feature='chat'
            )
            
            return Response({
                'success': True,
                'response': response['choices'][0]['message']['content'],
                'model': response.get('model'),
                'usage': response.get('usage', {})
            })
            
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return Response(
                {'error': 'Failed to process chat request'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChatHistoryView(APIView):
    """Get user's chat history"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            chats = ChatHistory.objects.filter(
                user=request.user
            ).order_by('-created_at')[:50]
            
            serializer = ChatHistorySerializer(chats, many=True)
            return Response({
                'success': True,
                'history': serializer.data
            })
            
        except Exception as e:
            logger.error(f"Chat history error: {str(e)}")
            return Response(
                {'error': 'Failed to fetch chat history'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DietPlanView(APIView):
    """Generate personalized meal plans"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        preferences = request.data.get('preferences', {})
        
        try:
            # Get user's health profile
            health_profile = UserHealthProfile.objects.filter(user=request.user).first()
            
            # Build user profile dict with available fields
            user_profile = {
                'health_score': health_profile.health_score if health_profile else 'Unknown',
                'diet_type': health_profile.diet_type if health_profile else 'balanced',
                'exercise_frequency': health_profile.exercise_frequency if health_profile else 'moderate',
                'smoking_status': health_profile.smoking_status if health_profile else 'never',
                'alcohol_consumption': health_profile.alcohol_consumption if health_profile else 'occasional',
                'level': health_profile.level if health_profile else 'Unknown',
                'points': health_profile.points if health_profile else 0
            }
            
            # Generate meal plan
            result = openrouter_service.generate_meal_plan(
                preferences=preferences,
                user_profile=user_profile,
                user=request.user
            )
            
            return Response(result)
            
        except Exception as e:
            logger.error(f"Meal plan error: {str(e)}")
            return Response(
                {'error': 'Failed to generate meal plan'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ============================================
# FIXED: SymptomAnalysisView with proper response handling
# ============================================
class SymptomAnalysisView(APIView):
    """Analyze symptoms and provide guidance"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        symptoms = request.data.get('symptoms', [])
        duration = request.data.get('duration', '')
        
        # Log the request for debugging
        logger.info(f"📝 Symptom analysis request: symptoms={symptoms}, duration={duration}")
        
        if not symptoms:
            return Response(
                {'error': 'Symptoms are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get user's health profile if available
            health_profile = UserHealthProfile.objects.filter(user=request.user).first()
            user_profile = None
            if health_profile:
                user_profile = {
                    'age': request.user.age if hasattr(request.user, 'age') else None,
                    'gender': request.user.gender if hasattr(request.user, 'gender') else None,
                    'health_conditions': []  # Add if you have this data
                }
            
            # Call the service
            result = openrouter_service.analyze_symptoms(
                symptoms=symptoms,
                duration=duration,
                user=request.user,
                user_profile=user_profile
            )
            
            # Log the result for debugging
            logger.info(f"📤 Symptom analysis result: success={result.get('success')}, has_analysis={bool(result.get('analysis'))}")
            
            # Ensure analysis is always a string
            analysis_text = result.get('analysis', '')
            if not isinstance(analysis_text, str):
                analysis_text = str(analysis_text)
            
            # Prepare response
            response_data = {
                'success': True,
                'analysis': analysis_text,  # Guaranteed to be a string
                'disclaimer': result.get('disclaimer', '⚠️ This is AI-generated information and NOT medical advice.'),
                'model': result.get('model', 'unknown')
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"❌ Symptom analysis error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Provide a helpful error response
            return Response({
                'success': True,  # Still return success=true with fallback
                'analysis': f"""**Unable to Complete Analysis**

I'm having trouble connecting to the AI service right now. Please try again in a few moments.

**Your Symptoms:** {', '.join(symptoms)}
**Duration:** {duration}

**General Guidance:**
• If symptoms are severe or emergency, seek immediate care
• Rest and stay hydrated
• Monitor your symptoms
• Consult a healthcare professional if concerned

⚠️ This is general guidance. Please consult a healthcare professional for proper medical advice.""",
                'disclaimer': '⚠️ Service temporarily unavailable. Using general guidance.',
                'model': 'fallback'
            }, status=status.HTTP_200_OK)  # Return 200 with fallback, not 500

class TestAIView(APIView):
    """Test AI connection"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Simple test message
            response = openrouter_service.chat_completion(
                messages=[{'role': 'user', 'content': 'Say "AI is working!" if you receive this.'}],
                user=request.user,
                feature='test',
                max_tokens=50
            )
            
            content = response['choices'][0]['message']['content']
            
            return Response({
                'success': True,
                'message': 'AI service is working',
                'response': content,
                'model': response.get('model')
            })
            
        except Exception as e:
            logger.error(f"AI test error: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)