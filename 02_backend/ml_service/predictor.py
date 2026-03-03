import joblib
import pickle
import numpy as np
import pandas as pd
import json
from pathlib import Path
import logging
from .utils.validators import validate_patient_data, format_patient_data

logger = logging.getLogger(__name__)

class DiabetesPredictor:
    """
    Diabetes Prediction Service with robust model loading
    """
    
    def __init__(self, model_version='v1'):
        self.model_version = model_version
        self.model_path = Path(__file__).parent / 'models' / f'diabetes_model_{model_version}'
        self.model = None
        self.scaler = None
        self.metadata = None
        self.feature_names = []
        self.load_models()
        logger.info(f"✅ DiabetesPredictor initialized with model version {self.model_version}")
    
    def load_models(self):
        """Load all model artifacts with multiple fallback methods"""
        try:
            # Load metadata first
            metadata_file = self.model_path / 'metadata.json'
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    self.metadata = json.load(f)
                self.feature_names = self.metadata.get('feature_names', [])
                logger.info(f"✅ Metadata loaded with {len(self.feature_names)} features")
            else:
                logger.warning("No metadata.json found")
                self.feature_names = []
            
            # Load scaler
            scaler_path = self.model_path / 'scaler.pkl'
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
                logger.info("✅ Scaler loaded")
            else:
                logger.warning("No scaler found, assuming data is already scaled")
                self.scaler = None
            
            # Try multiple methods to load model in order of preference
            model_loaders = [
                # Pickle protocol 4 (most compatible)
                ('pickle_protocol4', lambda: pickle.load(open(self.model_path / 'model_protocol4.pkl', 'rb'))),
                
                # Pickle protocol 5
                ('pickle_protocol5', lambda: pickle.load(open(self.model_path / 'model_protocol5.pkl', 'rb'))),
                
                # Joblib with no compression
                ('joblib_nocomp', lambda: joblib.load(self.model_path / 'model_joblib_nocomp.pkl')),
                
                # Joblib with zlib compression
                ('joblib_zlib', lambda: joblib.load(self.model_path / 'model_joblib_zlib.pkl')),
                
                # Original joblib
                ('joblib_original', lambda: joblib.load(self.model_path / 'model.pkl')),
                
                # Try to reconstruct from parameters
                ('params', self._load_from_params)
            ]
            
            model_loaded = False
            for loader_name, loader_func in model_loaders:
                try:
                    self.model = loader_func()
                    if self.model is not None:
                        logger.info(f"✅ Model loaded using {loader_name}")
                        model_loaded = True
                        break
                except Exception as e:
                    logger.warning(f"{loader_name} failed: {e}")
                    continue
            
            if not model_loaded:
                raise Exception("Could not load model with any method")
            
            logger.info(f"✅ Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise
    
    def _load_from_params(self):
        """Try to reconstruct model from saved parameters"""
        params_file = self.model_path / 'model_params.pkl'
        if not params_file.exists():
            return None
        
        try:
            with open(params_file, 'rb') as f:
                params = pickle.load(f)
            
            # For now, just return the params as a fallback
            # This won't be callable but at least we have the data
            logger.warning("Loaded parameters only - model may not be fully functional")
            return params
        except:
            return None
    
    def predict(self, patient_data):
        """
        Make diabetes prediction for a single patient
        """
        try:
            # Format input data
            formatted_data = format_patient_data(patient_data)
            
            # Validate input if we have feature names
            if self.feature_names:
                is_valid, error_msg = validate_patient_data(formatted_data, self.feature_names)
                if not is_valid:
                    return {'success': False, 'error': error_msg}
            
            # Convert to DataFrame
            df = pd.DataFrame([formatted_data])
            
            # Ensure all features exist if we have feature names
            if self.feature_names:
                for feature in self.feature_names:
                    if feature not in df.columns:
                        df[feature] = 0
                df = df[self.feature_names]
            
            # Scale features if scaler exists
            if self.scaler is not None:
                df_scaled = self.scaler.transform(df)
            else:
                df_scaled = df.values
            
            # Make prediction
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(df_scaled)[0]
                prediction = self.model.predict(df_scaled)[0]
            elif hasattr(self.model, 'predict'):
                prediction = self.model.predict(df_scaled)[0]
                # Create dummy probabilities
                probabilities = [0.5, 0.5]
            else:
                # Model is just parameters, can't predict
                return {
                    'success': False,
                    'error': 'Model loaded in limited mode - cannot make predictions'
                }
            
            # Determine risk level
            risk_score = float(probabilities[1] if len(probabilities) > 1 else probabilities[0])
            if risk_score < 0.3:
                risk_level = 'Low'
            elif risk_score < 0.6:
                risk_level = 'Moderate'
            else:
                risk_level = 'High'
            
            # Prepare response
            result = {
                'success': True,
                'prediction': {
                    'class': int(prediction),
                    'label': 'Diabetes' if prediction == 1 else 'No Diabetes',
                    'probability': risk_score,
                    'confidence': float(max(probabilities)),
                    'risk_level': risk_level
                },
                'model_info': {
                    'version': self.model_version,
                    'name': self.metadata.get('model_name', 'Unknown') if self.metadata else 'Unknown',
                    'f1_score': self.metadata.get('f1_score', None) if self.metadata else None
                }
            }
            
            logger.info(f"Prediction made: {result['prediction']['label']} ({risk_score:.2%})")
            return result
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_model_info(self):
        """Get model metadata"""
        if self.metadata:
            return {
                'version': self.metadata.get('version', 'v1'),
                'name': self.metadata.get('model_name', 'Unknown'),
                'f1_score': self.metadata.get('f1_score', None),
                'roc_auc': self.metadata.get('roc_auc', None),
                'features': self.feature_names,
                'n_features': len(self.feature_names)
            }
        else:
            return {
                'version': self.model_version,
                'name': 'Unknown',
                'f1_score': None,
                'features': self.feature_names,
                'n_features': len(self.feature_names)
            }


# Singleton instance
_predictor_instance = None

def get_predictor(model_version='v1'):
    """Get or create predictor instance"""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = DiabetesPredictor(model_version)
    return _predictor_instance
