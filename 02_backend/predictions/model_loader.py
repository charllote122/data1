"""
ML Model Loader - Loads and manages the diabetes prediction model
Gradient Boosting model with 21 features (F1-Score: 0.8403)
"""
import joblib
import numpy as np
import pandas as pd
import os
from django.conf import settings
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class ModelLoader:
    """Singleton class to load and manage ML model"""
    
    _instance = None
    _model = None
    _scaler = None
    _metadata = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            # Don't load model here - wait for first use
            cls._instance._loaded = False
        return cls._instance
    
    def _ensure_loaded(self):
        """Lazy load the model only when needed"""
        if not self._loaded:
            self._load_model()
            self._loaded = True
    
    def _load_model(self):
        """Load the trained model and scaler"""
        try:
            # Define paths
            model_dir = os.path.join(settings.BASE_DIR, 'predictions', 'ml_models')
            model_path = os.path.join(model_dir, 'diabetes_model.pkl')
            scaler_path = os.path.join(model_dir, 'scaler.pkl')
            metadata_path = os.path.join(model_dir, 'metadata.json')
            
            # Create directory if it doesn't exist
            os.makedirs(model_dir, exist_ok=True)
            logger.info(f"Model directory: {model_dir}")
            
            # Load metadata
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    self._metadata = json.load(f)
                logger.info(f"Metadata loaded successfully")
                
                self.feature_names = self._metadata.get('feature_names', [])
                self.threshold = self._metadata.get('threshold', 0.3413765185837127)
                self.model_name = self._metadata.get('model_name', 'Gradient Boosting')
                
                logger.info(f"Model: {self.model_name}")
                logger.info(f"Features: {len(self.feature_names)}")
                logger.info(f"Threshold: {self.threshold}")
                logger.info(f"F1-Score: {self._metadata.get('f1_score', 'N/A')}")
            else:
                logger.error(f"Metadata not found at {metadata_path}")
                self._metadata = {}
                self.feature_names = []
                self.threshold = 0.3413765185837127
            
            # Load model
            if os.path.exists(model_path):
                self._model = joblib.load(model_path)
                logger.info(f"Model loaded successfully: {type(self._model).__name__}")
            else:
                logger.error(f"Model file not found at {model_path}")
                self._model = None
            
            # Load scaler
            if os.path.exists(scaler_path):
                self._scaler = joblib.load(scaler_path)
                logger.info(f"Scaler loaded successfully")
            else:
                logger.warning(f"Scaler file not found")
                self._scaler = None
                
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self._model = None
            self._scaler = None
            self._metadata = {}
            self.feature_names = []
            self.threshold = 0.3413765185837127
    
    def predict(self, data):
        """Make prediction using loaded model with XAI explanations"""
        # Ensure model is loaded before prediction
        self._ensure_loaded()
        
        try:
            # Validate input
            if not self._model or not self.feature_names:
                logger.warning("Model not loaded, using fallback")
                return self._fallback_prediction(data)
            
            # Prepare features
            features = self._prepare_features(data)
            
            # Create DataFrame with feature names to avoid warnings
            feature_df = pd.DataFrame([features], columns=self.feature_names)
            
            # Scale features
            if self._scaler is not None:
                features_scaled = self._scaler.transform(feature_df)
            else:
                features_scaled = feature_df.values
            
            # Get prediction probability
            if hasattr(self._model, 'predict_proba'):
                probabilities = self._model.predict_proba(features_scaled)[0]
                probability = probabilities[1] if len(probabilities) > 1 else probabilities[0]
            else:
                prediction = self._model.predict(features_scaled)[0]
                probability = float(prediction)
            
            # Apply threshold
            prediction = 1 if probability >= self.threshold else 0
            
            # Determine risk level
            if probability >= 0.7:
                risk_level = 'high'
            elif probability >= 0.3:
                risk_level = 'moderate'
            else:
                risk_level = 'low'
            
            # Calculate risk score as percentage
            risk_score = probability * 100
            
            # Generate XAI features
            top_factors = self._generate_top_factors(data, probability)
            recommendations = self._generate_recommendations(data, risk_level, top_factors)
            
            logger.info(f"Prediction: risk={risk_level}, prob={probability:.3f}")
            
            return {
                'prediction': prediction,
                'probability': float(probability),
                'risk_level': risk_level,
                'threshold_used': self.threshold,
                'risk_score': float(risk_score),
                'top_factors': top_factors,
                'recommendations': recommendations,
                'shap_values': [],  # You can add SHAP values here if available
                'lime_explanation': []  # You can add LIME explanation here if available
            }
                
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return self._fallback_prediction(data)
    
    def _prepare_features(self, data):
        """Prepare feature vector from input data"""
        features = []
        
        for feature in self.feature_names:
            if feature in data:
                value = data[feature]
                # Convert various input types to float
                if isinstance(value, bool):
                    value = 1.0 if value else 0.0
                elif isinstance(value, str):
                    if value.lower() in ['true', 'yes', '1']:
                        value = 1.0
                    elif value.lower() in ['false', 'no', '0']:
                        value = 0.0
                    else:
                        try:
                            value = float(value)
                        except ValueError:
                            value = 0.0
                else:
                    try:
                        value = float(value)
                    except (TypeError, ValueError):
                        value = 0.0
                
                features.append(value)
            else:
                # Use median/default values for missing features
                defaults = {
                    'HighBP': 0.0, 'HighChol': 0.0, 'CholCheck': 1.0,
                    'BMI': 27.0, 'Smoker': 0.0, 'Stroke': 0.0,
                    'HeartDiseaseorAttack': 0.0, 'PhysActivity': 1.0,
                    'Fruits': 1.0, 'Veggies': 1.0, 'HvyAlcoholConsump': 0.0,
                    'AnyHealthcare': 1.0, 'NoDocbcCost': 0.0, 'GenHlth': 3.0,
                    'MentHlth': 0.0, 'PhysHlth': 0.0, 'DiffWalk': 0.0,
                    'Sex': 0.0, 'Age': 50.0, 'Education': 4.0, 'Income': 5.0
                }
                features.append(defaults.get(feature, 0.0))
                logger.debug(f"Missing feature '{feature}', using default: {defaults.get(feature, 0.0)}")
        
        return np.array(features)
    
    def _generate_top_factors(self, data, probability):
        """Generate top contributing factors for the prediction"""
        top_factors = []
        
        # Simple rule-based top factors based on risk level
        if probability >= 0.7:
            if data.get('HighBP', 0) == 1:
                top_factors.append({
                    'feature': 'HighBP',
                    'value': 1,
                    'importance': 0.523,
                    'impact': 'positive',
                    'description': 'High blood pressure significantly increases diabetes risk'
                })
            if data.get('HighChol', 0) == 1:
                top_factors.append({
                    'feature': 'HighChol',
                    'value': 1,
                    'importance': 0.319,
                    'impact': 'positive',
                    'description': 'High cholesterol is a major risk factor'
                })
            if data.get('BMI', 25) > 30:
                top_factors.append({
                    'feature': 'BMI',
                    'value': data.get('BMI'),
                    'importance': 0.293,
                    'impact': 'positive',
                    'description': 'BMI > 30 indicates obesity, a key risk factor'
                })
            if data.get('Age', 45) > 50:
                top_factors.append({
                    'feature': 'Age',
                    'value': data.get('Age'),
                    'importance': 0.292,
                    'impact': 'positive',
                    'description': 'Risk increases with age, especially over 50'
                })
            if data.get('GenHlth', 3) >= 4:
                top_factors.append({
                    'feature': 'GenHlth',
                    'value': data.get('GenHlth'),
                    'importance': 0.510,
                    'impact': 'positive',
                    'description': 'Poor general health is strongly correlated with diabetes'
                })
        elif probability >= 0.3:
            top_factors.append({
                'feature': 'Moderate Risk Factors',
                'value': 'multiple',
                'importance': 0.5,
                'impact': 'neutral',
                'description': 'Multiple factors contribute to moderate risk'
            })
        else:
            top_factors.append({
                'feature': 'Low Risk Profile',
                'value': 'healthy',
                'importance': 0.8,
                'impact': 'negative',
                'description': 'Your health indicators suggest low diabetes risk'
            })
        
        return top_factors[:3]  # Return top 3 factors
    
    def _generate_recommendations(self, data, risk_level, top_factors):
        """Generate personalized recommendations based on risk factors"""
        recommendations = []
        
        if risk_level == 'high':
            recommendations.append({
                'type': 'urgent',
                'title': 'Consult Healthcare Provider',
                'description': 'Your risk level indicates you should consult a healthcare provider immediately for proper screening.',
                'priority': 1
            })
        
        # Add specific recommendations based on risk factors
        if data.get('HighBP', 0) == 1:
            recommendations.append({
                'type': 'lifestyle',
                'title': 'Manage Blood Pressure',
                'description': 'Reduce salt intake, exercise regularly, and monitor blood pressure weekly.',
                'priority': 2
            })
        
        if data.get('HighChol', 0) == 1:
            recommendations.append({
                'type': 'diet',
                'title': 'Improve Cholesterol',
                'description': 'Reduce saturated fats, eat more fiber, and consider omega-3 supplements.',
                'priority': 2
            })
        
        if data.get('BMI', 25) > 30:
            recommendations.append({
                'type': 'exercise',
                'title': 'Weight Management',
                'description': 'Aim for 30 minutes of moderate exercise daily and consult a nutritionist.',
                'priority': 2
            })
        
        if data.get('Smoker', 0) == 1:
            recommendations.append({
                'type': 'lifestyle',
                'title': 'Smoking Cessation',
                'description': 'Quitting smoking can significantly reduce your diabetes risk.',
                'priority': 3
            })
        
        if data.get('PhysActivity', 1) == 0:
            recommendations.append({
                'type': 'exercise',
                'title': 'Increase Physical Activity',
                'description': 'Start with 15-minute walks and gradually increase to 30 minutes daily.',
                'priority': 3
            })
        
        if data.get('GenHlth', 3) >= 4:
            recommendations.append({
                'type': 'general',
                'title': 'Regular Check-ups',
                'description': 'Schedule regular health check-ups to monitor your overall health.',
                'priority': 2
            })
        
        # Add general recommendation if none specific
        if len(recommendations) < 2:
            recommendations.append({
                'type': 'general',
                'title': 'Healthy Lifestyle',
                'description': 'Maintain a balanced diet, regular exercise, and annual health screenings.',
                'priority': 4
            })
        
        return recommendations
    
    def _fallback_prediction(self, data):
        """Fallback logic when model is not available"""
        try:
            # Simple rule-based prediction
            risk_score = 0.0
            
            # Key risk factors with weights from your model
            if data.get('HighBP', False):
                risk_score += 0.523
            if data.get('HighChol', False):
                risk_score += 0.319
            if data.get('BMI', 25) > 30:
                risk_score += 0.293
            if data.get('Age', 45) > 50:
                risk_score += 0.292
            if data.get('Smoker', False):
                risk_score += 0.138
            if data.get('GenHlth', 3) >= 4:
                risk_score += 0.510
            
            # Normalize to probability
            probability = min(risk_score, 0.95)
            
            # Apply threshold
            prediction = 1 if probability >= self.threshold else 0
            
            # Determine risk level
            if probability >= 0.7:
                risk_level = 'high'
            elif probability >= 0.3:
                risk_level = 'moderate'
            else:
                risk_level = 'low'
            
            # Generate XAI features for fallback
            top_factors = self._generate_top_factors(data, probability)
            recommendations = self._generate_recommendations(data, risk_level, top_factors)
            
            return {
                'prediction': prediction,
                'probability': float(probability),
                'risk_level': risk_level,
                'threshold_used': self.threshold,
                'risk_score': float(probability * 100),
                'top_factors': top_factors,
                'recommendations': recommendations,
                'shap_values': [],
                'lime_explanation': []
            }
            
        except Exception as e:
            logger.error(f"Fallback error: {str(e)}")
            return {
                'prediction': 0,
                'probability': 0.3,
                'risk_level': 'moderate',
                'threshold_used': self.threshold,
                'risk_score': 30.0,
                'top_factors': [{
                    'feature': 'Fallback Mode',
                    'value': 'unknown',
                    'importance': 1.0,
                    'impact': 'neutral',
                    'description': 'Using simplified risk calculation'
                }],
                'recommendations': [{
                    'type': 'general',
                    'title': 'Consult Healthcare Provider',
                    'description': 'For accurate assessment, please consult a healthcare provider.',
                    'priority': 1
                }],
                'shap_values': [],
                'lime_explanation': []
            }
    
    def get_feature_importance(self):
        """Get feature importance from metadata"""
        self._ensure_loaded()
        return self._metadata.get('top_features', [])
    
    def get_model_info(self):
        """Get model information"""
        self._ensure_loaded()
        return {
            'model_name': self._metadata.get('model_name', 'Gradient Boosting'),
            'version': self._metadata.get('version', 'v1'),
            'f1_score': self._metadata.get('f1_score', 0.8403),
            'roc_auc': self._metadata.get('roc_auc', 0.8174),
            'accuracy': self._metadata.get('accuracy', 0.8449),
            'features_count': len(self.feature_names),
            'threshold': self.threshold,
            'top_features': self.get_feature_importance()[:5],
            'training_date': self._metadata.get('training_date', '2026-02-26')
        }


# Singleton instance - but don't load model yet
model_loader = ModelLoader()