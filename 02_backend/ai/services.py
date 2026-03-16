# backend/ai/services.py
import requests
import json
import logging
import time
import random
import socket
from django.conf import settings
from django.core.cache import cache
from .models import ChatHistory, MealPlan, SymptomCheck, AITokenUsage
from django.utils import timezone
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, before_log, after_log

# Set up logger
logger = logging.getLogger(__name__)

# Custom retry condition for connection errors
def is_connection_error(exception):
    return isinstance(exception, (requests.exceptions.ConnectionError, 
                                  requests.exceptions.Timeout,
                                  socket.error))

class OpenRouterService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.default_model = settings.OPENROUTER_DEFAULT_MODEL
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'HTTP-Referer': settings.OPENROUTER_SITE_URL,
            'X-Title': settings.OPENROUTER_SITE_NAME
        }
        
        # Model configurations from settings
        self.model_configs = getattr(settings, 'AI_MODELS', {})
        self.temperatures = getattr(settings, 'AI_TEMPERATURE', {})
        self.max_tokens_config = getattr(settings, 'AI_MAX_TOKENS', {})
        
        # ============================================
        # UPDATED: 30+ FREE MODELS for better rotation
        # ============================================
        self.free_models = [
            # Primary free models (most reliable)
            'openrouter/free',  # Auto-routes to available free models
            'google/gemma-3-12b-it:free',
            'google/gemma-2-9b-it:free',
            'google/gemma-2-2b-it:free',
            
            # StepFun models
            'stepfun/step-3.5-flash:free',
            'stepfun/step-2-16k:free',
            
            # Liquid models
            'liquid/lfm-2.5-1.2b-thinking:free',
            'liquid/lfm-2.5-1.2b-instruct:free',
            
            # NVIDIA models
            'nvidia/nemotron-3-nano-30b-a3b:free',
            'nvidia/nemotron-nano-12b-v2-vl:free',
            'nvidia/nemotron-nano-9b-v2:free',
            'nvidia/nemotron-4-4b-instruct:free',
            
            # Qwen models
            'qwen/qwen3-next-80b-a3b-instruct:free',
            'qwen/qwen3-next-30b-a3b-instruct:free',
            'qwen/qwen-2.5-72b-instruct:free',
            'qwen/qwen-2.5-32b-instruct:free',
            'qwen/qwen-2.5-14b-instruct:free',
            'qwen/qwen-2.5-7b-instruct:free',
            
            # Arcee AI models
            'arcee-ai/trinity-large-preview:free',
            'arcee-ai/trinity-mini:free',
            
            # Microsoft models
            'microsoft/phi-3.5-mini-4k-instruct:free',
            'microsoft/phi-3.5-moe-instruct:free',
            'microsoft/phi-3-medium-4k-instruct:free',
            'microsoft/phi-3-mini-4k-instruct:free',
            
            # Meta models
            'meta-llama/llama-3.2-3b-instruct:free',
            'meta-llama/llama-3.2-1b-instruct:free',
            'meta-llama/llama-3.1-8b-instruct:free',
            
            # Mistral models
            'mistralai/mistral-7b-instruct:free',
            'mistralai/mistral-7b-v0.3:free',
            
            # Other free models
            'cognitivecomputations/dolphin-2.9.2-llama-3.1-8b:free',
            'sao10k/l3-70b-euryale-v2.1:free',
            'sao10k/l3.1-70b-euryale-v2.2:free',
            'anthropic/claude-3-haiku:free',  # Limited free tier
            'cohere/command-r-plus-08-2024:free',
            'cohere/command-r-08-2024:free',
        ]
        
        # Model categories for different features
        self.chat_models = self.free_models  # Use all for chat
        
        self.meal_plan_models = [
            'stepfun/step-3.5-flash:free',
            'google/gemma-3-12b-it:free',
            'qwen/qwen-2.5-14b-instruct:free',
            'microsoft/phi-3.5-mini-4k-instruct:free',
        ]
        
        self.symptom_models = [
            'liquid/lfm-2.5-1.2b-thinking:free',
            'google/gemma-3-12b-it:free',
            'stepfun/step-3.5-flash:free',
            'qwen/qwen-2.5-7b-instruct:free',
            'microsoft/phi-3.5-mini-4k-instruct:free',
        ]
        
        self.current_model_index = 0
        
        # Track rate limit hits per feature
        self.rate_limit_hits = {
            'chat': 0,
            'meal_plan': 0,
            'symptom': 0,
            'test': 0
        }
        
        # Track last successful model per feature
        self.last_successful_model = {
            'chat': None,
            'meal_plan': None,
            'symptom': None
        }
        
        # Create a session for connection reuse
        self.session = requests.Session()
        
        logger.info(f"🤖 OpenRouter Service initialized with {len(self.free_models)} free models")
        logger.info(f"📊 Chat models: {len(self.chat_models)}")
        logger.info(f"🍽️ Meal plan models: {len(self.meal_plan_models)}")
        logger.info(f"🩺 Symptom models: {len(self.symptom_models)}")
    
    def _get_next_model(self, feature='chat'):
        """Rotate through free models to avoid rate limits with fallback options"""
        
        # Get the appropriate model list for the feature
        if feature == 'meal_plan':
            model_list = self.meal_plan_models
        elif feature == 'symptom':
            model_list = self.symptom_models
        else:  # chat and others
            model_list = self.chat_models
        
        # If we have a last successful model, try it first with 30% probability
        if self.last_successful_model.get(feature) and random.random() < 0.3:
            model = self.last_successful_model[feature]
            logger.info(f"🔄 Reusing last successful {feature} model: {model}")
            return model
        
        # Get next model in rotation
        model = model_list[self.current_model_index % len(model_list)]
        self.current_model_index = (self.current_model_index + 1) % len(model_list)
        
        # If rate limit hits are high, skip ahead a few models
        if self.rate_limit_hits.get(feature, 0) > 3:
            skip = random.randint(2, 5)
            self.current_model_index = (self.current_model_index + skip) % len(model_list)
            model = model_list[self.current_model_index % len(model_list)]
            logger.info(f"⏭️ Skipping ahead {skip} models due to rate limits: {model}")
        
        logger.info(f"🔄 Rotating to {feature} model: {model}")
        return model
    
    def _safe_cache_get(self, cache_key):
        """Safely get from cache with error handling"""
        try:
            return cache.get(cache_key)
        except Exception as e:
            logger.warning(f"Cache get error (continuing without cache): {e}")
            return None
    
    def _safe_cache_set(self, cache_key, value, timeout):
        """Safely set cache with error handling"""
        try:
            cache.set(cache_key, value, timeout)
        except Exception as e:
            logger.warning(f"Cache set error (continuing without cache): {e}")
    
    def _get_rate_limit_fallback(self, feature):
        """Return enhanced fallback responses when rate limited"""
        logger.info(f"📋 Using enhanced fallback response for {feature} due to rate limiting")
        
        fallback_messages = {
            'chat': {
                'content': """I'm currently experiencing high demand. Here are some diabetes-friendly tips while you wait:

🥗 **Diet Tips:**
• Eat plenty of non-starchy vegetables (broccoli, spinach, carrots)
• Choose whole grains over refined grains
• Include lean proteins like fish, chicken, and legumes
• Limit sugary drinks and processed foods
• Stay hydrated with water

🏃 **Lifestyle Tips:**
• Aim for 30 minutes of moderate exercise daily
• Monitor your blood sugar regularly
• Get adequate sleep (7-9 hours)
• Manage stress through meditation or deep breathing

📊 **Blood Sugar Management:**
• Check blood sugar before and after meals
• Keep a log of your readings
• Note how different foods affect your levels
• Share your log with your healthcare provider

Please try again in a few minutes for personalized responses."""
            },
            'meal_plan': {
                'content': """I'm currently experiencing high demand. Here's a sample healthy meal plan:

🌅 **Breakfast Options:**
• Greek yogurt with berries and a sprinkle of nuts
• Scrambled eggs with spinach and whole grain toast
• Oatmeal with cinnamon and sliced apple

☀️ **Lunch Options:**
• Grilled chicken salad with mixed greens and olive oil
• Quinoa bowl with roasted vegetables and chickpeas
• Turkey and avocado wrap with whole wheat tortilla

🌙 **Dinner Options:**
• Baked salmon with roasted asparagus and quinoa
• Lean turkey chili with beans and vegetables
• Stir-fried tofu with broccoli and brown rice

🍎 **Snack Ideas:**
• Apple slices with almond butter
• Vegetable sticks with hummus
• Handful of almonds and a small piece of fruit

Please try again for a personalized meal plan tailored to your preferences."""
            },
            'symptom': {
                'content': """I'm currently experiencing high demand. Here's general guidance for common symptoms:

🚨 **EMERGENCY SYMPTOMS - Call Emergency Immediately:**
• Chest pain or pressure
• Difficulty breathing or shortness of breath
• Severe bleeding that won't stop
• Sudden severe headache (worst of your life)
• Confusion or difficulty speaking
• Loss of consciousness or fainting
• Seizure
• Severe allergic reaction with swelling

🤒 **Common Symptom Guidance:**

**For Fever:**
• Rest and stay hydrated
• Take acetaminophen or ibuprofen as directed
• Monitor temperature every 4-6 hours
• See doctor if fever >103°F or lasts >3 days

**For Headache:**
• Rest in a dark, quiet room
• Apply cold or warm compress
• Stay hydrated
• Over-the-counter pain relievers as needed
• See doctor if severe or with vision changes

**For Cough/Cold:**
• Rest and drink warm fluids with honey
• Use humidifier
• Over-the-counter cough medicine
• See doctor if breathing difficulty or lasts >10 days

**For Digestive Issues:**
• Eat bland foods (BRAT diet: bananas, rice, applesauce, toast)
• Stay hydrated with clear liquids
• Avoid dairy, fatty, or spicy foods
• See doctor if severe pain, blood, or persists >3 days

**For Diabetes-Related Symptoms:**
• Check blood sugar immediately
• If low (<70 mg/dL): consume 15g fast-acting carbs
• If high (>250 mg/dL): check ketones, drink water
• Contact your healthcare team if concerned

⚠️ This is general guidance. For personalized advice, please try again in a few minutes or consult your healthcare provider."""
            }
        }
        
        fallback = fallback_messages.get(feature, fallback_messages['chat'])
        
        return {
            'choices': [{
                'message': {
                    'content': fallback['content']
                }
            }],
            'model': f'fallback-{feature}',
            'usage': {'total_tokens': 0, 'prompt_tokens': 0, 'completion_tokens': 0}
        }
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=(retry_if_exception_type(requests.exceptions.ConnectionError) | 
               retry_if_exception_type(requests.exceptions.Timeout) |
               retry_if_exception_type(socket.error) |
               retry_if_exception_type(requests.exceptions.HTTPError)),
        before=before_log(logger, logging.INFO),
        after=after_log(logger, logging.INFO)
    )
    def _make_api_call(self, data, feature):
        """Make API call with retry logic and rate limit handling"""
        
        # Create a new session for each attempt
        session = requests.Session()
        
        # Configure session with retry strategy
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        
        retry_strategy = Retry(
            total=1,
            backoff_factor=0.5,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        try:
            response = session.post(
                f'{self.base_url}/chat/completions',
                headers=self.headers,
                json=data,
                timeout=(10, 30),
                verify=True,
            )
            
            # Handle rate limiting
            if response.status_code == 429:
                self.rate_limit_hits[feature] = self.rate_limit_hits.get(feature, 0) + 1
                retry_after = int(response.headers.get('retry-after', 5))
                logger.warning(f"⚠️ Rate limited on {feature}. Hit #{self.rate_limit_hits[feature]}. Waiting {retry_after} seconds...")
                
                # Add jitter to avoid thundering herd
                jitter = random.uniform(0.5, 1.5)
                time.sleep(retry_after * jitter)
                
                # Try with a completely different model
                if self.rate_limit_hits[feature] > 1:
                    original_model = data.get('model')
                    new_model = self._get_next_model(feature)
                    logger.info(f"🔄 Switching model from {original_model} to {new_model}")
                    data['model'] = new_model
                
                response = session.post(
                    f'{self.base_url}/chat/completions',
                    headers=self.headers,
                    json=data,
                    timeout=(10, 30),
                    verify=True,
                )
                
                if response.status_code == 429:
                    raise requests.exceptions.HTTPError(f"Still rate limited after retry", response=response)
            
            response.raise_for_status()
            
            # On success, record this model as successful
            if feature in self.last_successful_model:
                self.last_successful_model[feature] = data.get('model')
                # Reduce rate limit counter on success
                self.rate_limit_hits[feature] = max(0, self.rate_limit_hits[feature] - 1)
            
            return response
            
        except requests.exceptions.HTTPError as e:
            if e.response is not None and e.response.status_code == 404:
                logger.error(f"❌ Model not found: {data.get('model')}")
                # Try a different model immediately
                raise
            elif e.response is not None and e.response.status_code == 429:
                logger.warning(f"⚠️ Rate limit persisted for {feature}")
                raise
            else:
                logger.error(f"❌ HTTP error for {feature}: {e}")
                if e.response:
                    logger.error(f"Response body: {e.response.text}")
                raise
        except Exception as e:
            logger.error(f"❌ Unexpected error in API call for {feature}: {e}")
            raise
        finally:
            session.close()
    
    def chat_completion(self, messages, user=None, model=None, temperature=None, max_tokens=None, feature='chat'):
        """Send a chat completion request to OpenRouter with database saving"""
        
        # Use feature-specific defaults if not provided
        if model is None:
            model = self._get_next_model(feature)
        
        temperature = temperature or self.temperatures.get(feature, 0.7)
        max_tokens = max_tokens or self.max_tokens_config.get(feature, 800)
        
        # Try cache first
        cache_key = f"ai_response_{feature}_{model}_{hash(str(messages))}"
        cached_response = self._safe_cache_get(cache_key)
        if cached_response:
            logger.info(f"✅ Cache hit for {feature} with model {model}")
            return cached_response
        
        data = {
            'model': model,
            'messages': messages,
            'temperature': temperature,
            'max_tokens': max_tokens
        }
        
        try:
            logger.info(f"📤 Sending {feature} request to OpenRouter with model: {model}")
            
            # Make API call with retry logic
            response = self._make_api_call(data, feature)
            result = response.json()
            
            # Log the response structure for debugging
            logger.info(f"📥 Response received for {feature}")
            if 'choices' in result and len(result['choices']) > 0:
                content_preview = result['choices'][0]['message']['content'][:100]
                logger.info(f"Content preview: {content_preview}...")
            
            # Cache the response
            cache_timeout = getattr(settings, 'AI_CACHE_TIMEOUT', 300)
            self._safe_cache_set(cache_key, result, cache_timeout)
            
            # Save to database if user is provided
            if user and user.is_authenticated:
                self._save_to_database(user, messages, result, feature, model)
            
            # Log token usage
            tokens_used = result.get('usage', {}).get('total_tokens', 0)
            logger.info(f"✅ {feature} completed successfully. Tokens used: {tokens_used}")
            
            return result
            
        except requests.exceptions.HTTPError as e:
            if e.response is not None and e.response.status_code == 404:
                logger.error(f"❌ Model {model} not found for {feature}")
                # Try one more time with a different model
                try:
                    new_model = self._get_next_model(feature)
                    logger.info(f"🔄 Retrying with model: {new_model}")
                    data['model'] = new_model
                    response = self._make_api_call(data, feature)
                    result = response.json()
                    return result
                except:
                    return self._get_rate_limit_fallback(feature)
            elif e.response is not None and e.response.status_code == 429:
                logger.error(f"❌ Rate limit exceeded for {feature}")
                return self._get_rate_limit_fallback(feature)
            else:
                logger.error(f"❌ HTTP error for {feature}: {e}")
                return self._get_rate_limit_fallback(feature)
            
        except Exception as e:
            logger.error(f"❌ Unexpected error for {feature}: {str(e)}")
            return self._get_rate_limit_fallback(feature)
    
    def generate_meal_plan(self, preferences, user_profile, user=None):
        """Generate a personalized meal plan"""
        
        prompt = f"""Create a simple 1-day meal plan for someone with:
        - Diet type: {preferences.get('diet_type', 'balanced')}
        - Allergies: {', '.join(preferences.get('allergies', [])) or 'none'}
        - Goals: {preferences.get('goals', 'maintain health')}
        
        Include breakfast, lunch, dinner, and snacks. 
        Keep it practical, healthy, and easy to follow.
        Format with clear sections using bullet points.
        """
        
        try:
            response = self.chat_completion(
                messages=[{'role': 'user', 'content': prompt}],
                user=user,
                feature='meal_plan',
                max_tokens=1000
            )
            
            content = response['choices'][0]['message']['content']
            
            return {
                'success': True,
                'meal_plan': {
                    'text': content,
                    'model': response.get('model', 'unknown')
                }
            }
            
        except Exception as e:
            logger.error(f"Meal plan generation failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'meal_plan': {
                    'text': 'Unable to generate meal plan. Please try again.',
                    'tips': ['Try again later']
                }
            }
    
    def analyze_symptoms(self, symptoms, duration, user=None, user_profile=None):
        """Analyze symptoms and provide guidance"""
        
        # Convert symptoms list to string
        symptoms_text = ', '.join(symptoms) if isinstance(symptoms, list) else symptoms
        
        # Build a detailed prompt
        prompt = f"""As a helpful medical AI assistant, please analyze these symptoms:

SYMPTOMS: {symptoms_text}
DURATION: {duration}

Please provide a helpful response with the following sections:

1. POSSIBLE CAUSES: List 2-3 common causes (with disclaimer)
2. WHEN TO SEE A DOCTOR: Clear guidance on when medical attention is needed
3. SELF-CARE TIPS: Practical advice for managing symptoms at home
4. RED FLAGS: Symptoms that require emergency care

IMPORTANT: Always include a disclaimer that this is not medical advice.
Format the response with clear section headings using **bold text**.
Be compassionate but professional.
"""
        
        try:
            logger.info(f"📤 Analyzing symptoms: {symptoms_text} (duration: {duration})")
            
            # Make the API call
            response = self.chat_completion(
                messages=[{'role': 'user', 'content': prompt}],
                user=user,
                feature='symptom',
                temperature=0.5,
                max_tokens=800
            )
            
            # Extract the text content from the response
            analysis_text = ""
            model_used = response.get('model', 'unknown')
            
            # Check if we have a valid response with choices
            if 'choices' in response and len(response['choices']) > 0:
                if 'message' in response['choices'][0]:
                    analysis_text = response['choices'][0]['message']['content']
                    logger.info(f"✅ Extracted analysis text ({len(analysis_text)} chars)")
                else:
                    logger.warning("⚠️ No 'message' in response choices")
                    analysis_text = "I received a response but couldn't extract the analysis. Please try again."
            else:
                logger.warning("⚠️ No 'choices' in response or empty choices")
                analysis_text = "Unable to analyze symptoms at this time. Please try again."
            
            # Ensure analysis_text is a string
            if not isinstance(analysis_text, str):
                analysis_text = str(analysis_text)
            
            # If analysis_text is empty, use fallback
            if not analysis_text.strip():
                analysis_text = self._generate_fallback_analysis(symptoms, duration)
            
            # Return with analysis as a string (NOT null)
            return {
                'success': True,
                'analysis': analysis_text,
                'disclaimer': '⚠️ This is AI-generated information and NOT medical advice. Always consult a healthcare professional.',
                'model': model_used
            }
            
        except Exception as e:
            logger.error(f"❌ Symptom analysis failed: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # Generate a helpful fallback analysis
            fallback_text = self._generate_fallback_analysis(symptoms, duration)
            
            return {
                'success': True,  # Still return success=true with fallback
                'analysis': fallback_text,
                'disclaimer': '⚠️ Service temporarily unavailable. Using general guidance.',
                'model': 'fallback-symptom'
            }
    
    def _generate_fallback_analysis(self, symptoms, duration):
        """Generate a fallback analysis when API fails"""
        symptoms_text = ', '.join(symptoms) if isinstance(symptoms, list) else symptoms
        
        return f"""**Symptom Analysis (Enhanced Offline Mode)**

**Your Symptoms:** {symptoms_text}
**Duration:** {duration}

**Possible Causes:**
• Common viral infection or cold
• Stress and fatigue
• Dehydration
• Seasonal allergies
• Minor muscle strain

**When to See a Doctor:**
• Symptoms persist for more than 3 days
• Symptoms worsen despite home care
• You develop new or concerning symptoms
• You have underlying health conditions (diabetes, heart disease)

**Self-Care Tips:**
1. Get plenty of rest (7-9 hours of sleep)
2. Stay hydrated with water and electrolytes
3. Eat light, nutritious foods
4. Monitor your temperature if fever is present
5. Avoid strenuous activities
6. Use over-the-counter remedies as appropriate

**🚨 SEEK EMERGENCY CARE IMMEDIATELY IF:**
• Chest pain or pressure
• Difficulty breathing or shortness of breath
• Severe headache with stiff neck
• Confusion or difficulty speaking
• Severe abdominal pain
• Uncontrolled bleeding
• Loss of consciousness

⚠️ This is general guidance based on common symptoms. Please consult a healthcare professional for proper medical advice."""
    
    def _save_to_database(self, user, messages, result, feature, model):
        """Save AI interaction to database"""
        try:
            tokens_used = result.get('usage', {}).get('total_tokens', 0)
            response_content = result['choices'][0]['message']['content']
            
            # Track token usage
            AITokenUsage.objects.create(
                user=user,
                feature=feature,
                model=model,
                tokens=tokens_used,
                cost_estimate=self._calculate_cost(model, tokens_used)
            )
            
            # Save based on feature
            if feature == 'chat':
                user_message = next((msg['content'] for msg in reversed(messages) 
                                   if msg['role'] == 'user'), '')
                
                ChatHistory.objects.create(
                    user=user,
                    message=user_message,
                    response=response_content,
                    model_used=model,
                    tokens_used=tokens_used,
                    context={'full_conversation': messages[:-1]}
                )
                logger.info(f"💾 Saved chat history for user {user.id}")
            
            elif feature == 'symptom':
                # Get the user message (prompt)
                user_message = next((msg['content'] for msg in messages if msg['role'] == 'user'), '')
                
                SymptomCheck.objects.create(
                    user=user,
                    symptoms=user_message[:500],  # Store truncated symptoms
                    analysis=response_content,
                    model_used=model
                )
                logger.info(f"💾 Saved symptom check for user {user.id}")
                
        except Exception as e:
            logger.error(f"Failed to save to database: {str(e)}")
    
    def _calculate_cost(self, model, tokens):
        """Calculate approximate cost based on model and tokens"""
        # All free models have zero cost
        return 0
    
    def get_user_chat_history(self, user, limit=10):
        """Get recent chat history for a user"""
        return ChatHistory.objects.filter(user=user).order_by('-created_at')[:limit]
    
    def get_token_usage_stats(self, user=None, days=30):
        """Get token usage statistics"""
        from django.db.models import Sum
        from datetime import timedelta
        
        queryset = AITokenUsage.objects
        if user:
            queryset = queryset.filter(user=user)
        
        since = timezone.now() - timedelta(days=days)
        queryset = queryset.filter(created_at__gte=since)
        
        stats = queryset.values('feature').annotate(
            total_tokens=Sum('tokens')
        ).order_by('-total_tokens')
        
        return stats

# Create singleton instance
openrouter_service = OpenRouterService()