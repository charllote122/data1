import pickle
import json
import numpy as np
import pandas as pd
from pathlib import Path
import warnings
import sys
import types

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
warnings.filterwarnings("ignore", category=UserWarning, module="lightgbm")

# Monkey patch LightGBM's _LGBMCheckArray function
try:
    import lightgbm.sklearn
    from sklearn.utils.validation import check_array
    
    # Store the original function
    original_check_array = check_array
    
    # Create a patched version that handles both parameter names
    def patched_check_array(array, *args, **kwargs):
        if 'force_all_finite' in kwargs and 'ensure_all_finite' not in kwargs:
            kwargs['ensure_all_finite'] = kwargs.pop('force_all_finite')
        return original_check_array(array, *args, **kwargs)
    
    # Replace the function in sklearn.utils.validation
    import sklearn.utils.validation
    sklearn.utils.validation.check_array = patched_check_array
    
    # Also patch LightGBM's internal function if it exists
    if hasattr(lightgbm.sklearn, '_LGBMCheckArray'):
        lightgbm.sklearn._LGBMCheckArray = patched_check_array
        
    print("✅ Successfully patched array validation functions")
    
except ImportError:
    print("⚠️ LightGBM not installed, skipping patch")
except Exception as e:
    print(f"⚠️ Error during patching: {e}")

class ModelLoader:
    def __init__(self):
        self.model_path = Path(__file__).parent / 'models'
        self.load_models()
    
    def load_models(self):
        """Load all model artifacts from the models folder"""
        try:
            # Load model with error handling for version mismatches
            with open(self.model_path / 'best_model.pkl', 'rb') as f:
                self.model = pickle.load(f)
            
            # Load scaler
            with open(self.model_path / 'scaler.pkl', 'rb') as f:
                self.scaler = pickle.load(f)
            
            # Load feature names
            with open(self.model_path / 'feature_names.json', 'r') as f:
                self.feature_names = json.load(f)
            
            # Load optimal threshold
            with open(self.model_path / 'optimal_threshold.txt', 'r') as f:
                self.threshold = float(f.read())
            
            print(f"✅ Model loaded successfully with {len(self.feature_names)} features")
            print(f"   Optimal threshold: {self.threshold:.3f}")
            print(f"   Model type: {type(self.model).__name__}")
            
            # Print model components for debugging
            if hasattr(self.model, 'estimators_'):
                print(f"   Number of estimators: {len(self.model.estimators_)}")
            
        except Exception as e:
            print(f"❌ Error loading models: {str(e)}")
            raise e
    
    def _safe_transform(self, scaler, X):
        """
        Safely transform data with the scaler, handling version differences
        
        Args:
            scaler: The scaler object
            X: The data to transform
        
        Returns:
            Transformed data
        """
        try:
            # Try the standard way first
            return scaler.transform(X)
        except TypeError as e:
            if 'force_all_finite' in str(e):
                # For newer scikit-learn versions, ensure_all_finite is used
                # We need to patch the method temporarily
                import sklearn.utils.validation
                original_check_array = sklearn.utils.validation.check_array
                
                def temp_patched_check_array(array, *args, **kwargs):
                    if 'force_all_finite' in kwargs:
                        kwargs['ensure_all_finite'] = kwargs.pop('force_all_finite')
                    return original_check_array(array, *args, **kwargs)
                
                # Apply the patch
                sklearn.utils.validation.check_array = temp_patched_check_array
                
                try:
                    result = scaler.transform(X)
                    return result
                finally:
                    # Restore the original function
                    sklearn.utils.validation.check_array = original_check_array
            else:
                raise e
    
    def engineer_features(self, patient_data):
        """
        Transform base features into all 38 features expected by the model
        
        Args:
            patient_data: dict with base features (Age, Sex, BMI, etc.)
        
        Returns:
            dict with all 38 engineered features
        """
        # Start with base features
        df = pd.DataFrame([patient_data])
        
        # BMI Categories (based on WHO classification) - convert to int
        df['BMI_Underweight'] = (df['BMI'] < 18.5).astype(int)
        df['BMI_Normal'] = ((df['BMI'] >= 18.5) & (df['BMI'] < 25)).astype(int)
        df['BMI_Overweight'] = ((df['BMI'] >= 25) & (df['BMI'] < 30)).astype(int)
        df['BMI_Obese_1'] = ((df['BMI'] >= 30) & (df['BMI'] < 35)).astype(int)
        df['BMI_Obese_2'] = ((df['BMI'] >= 35) & (df['BMI'] < 40)).astype(int)
        df['BMI_Obese_3'] = (df['BMI'] >= 40).astype(int)
        
        # BMI transformations
        df['BMI_Squared'] = df['BMI'] ** 2
        df['BMI_Log'] = np.log1p(df['BMI'])  # log(1+BMI) to handle zero
        
        # Age Groups - convert to int
        df['Age_Young'] = (df['Age'] < 30).astype(int)
        df['Age_Middle'] = ((df['Age'] >= 30) & (df['Age'] < 50)).astype(int)
        df['Age_Senior'] = ((df['Age'] >= 50) & (df['Age'] < 70)).astype(int)
        df['Age_Elderly'] = (df['Age'] >= 70).astype(int)
        
        # Age transformations
        df['Age_Squared'] = df['Age'] ** 2
        
        # Risk Scores - ensure all values are int/float, not boolean
        # Convert boolean columns to int first
        highbp = df['HighBP'].astype(int)
        highchol = df['HighChol'].astype(int)
        stroke = df['Stroke'].astype(int)
        heart = df['HeartDiseaseorAttack'].astype(int)
        phys_activity = df['PhysActivity'].astype(int)
        fruits = df['Fruits'].astype(int)
        veggies = df['Veggies'].astype(int)
        smoker = df['Smoker'].astype(int)
        alcohol = df['HvyAlcoholConsump'].astype(int)
        
        # Cardiovascular risk sum
        df['Cardio_Risk_Sum'] = highbp + highchol + stroke + heart
        
        # Weighted cardiovascular risk
        df['Cardio_Risk_Weighted'] = highbp * 2 + highchol * 2 + stroke * 3 + heart * 3
        
        # Metabolic score (combines BMI, general health, physical health)
        df['Metabolic_Score'] = df['BMI'] / 10 + df['GenHlth'] + df['PhysHlth'] / 10
        
        # Lifestyle score - use addition and subtraction with int values
        df['Lifestyle_Score'] = phys_activity + fruits + veggies - smoker - alcohol
        
        # Return only the features the model expects, in the correct order
        return df[self.feature_names].iloc[0].to_dict()
    
    def predict(self, patient_data):
        """
        Make prediction for a single patient
        
        Args:
            patient_data: dict with base feature names as keys
        
        Returns:
            dict with prediction results
        """
        try:
            # Engineer all 38 features
            engineered_data = self.engineer_features(patient_data)
            
            # Convert to DataFrame with correct feature order
            df = pd.DataFrame([engineered_data])[self.feature_names]
            
            # Scale the features using the safe transform method
            scaled_features = self._safe_transform(self.scaler, df)
            
            # Convert to numpy array explicitly to avoid any DataFrame issues
            scaled_array = np.array(scaled_features)
            
            # Make prediction
            probabilities = self.model.predict_proba(scaled_array)[0]
            probability_diabetes = probabilities[1]
            
            # Apply threshold
            prediction = int(probability_diabetes >= self.threshold)
            
            # Determine risk level
            if prediction == 0:
                risk_level = 'low'
            elif probability_diabetes < 0.7:
                risk_level = 'moderate'
            else:
                risk_level = 'high'
            
            result = {
                'prediction': prediction,
                'probability': float(probability_diabetes),
                'risk_level': risk_level,
                'threshold_used': self.threshold
            }
            
            return result
            
        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    def predict_batch(self, patients_df):
        """
        Make predictions for multiple patients
        
        Args:
            patients_df: DataFrame with base features
        
        Returns:
            DataFrame with predictions
        """
        try:
            # Engineer features for all patients
            engineered_dfs = []
            for _, row in patients_df.iterrows():
                engineered = self.engineer_features(row.to_dict())
                engineered_dfs.append(pd.DataFrame([engineered]))
            
            # Combine all engineered features
            X_engineered = pd.concat(engineered_dfs, ignore_index=True)
            
            # Ensure correct feature order
            X = X_engineered[self.feature_names]
            
            # Scale features using the safe transform method
            X_scaled = self._safe_transform(self.scaler, X)
            
            # Convert to numpy array
            X_array = np.array(X_scaled)
            
            # Get probabilities
            probabilities = self.model.predict_proba(X_array)[:, 1]
            
            # Apply threshold
            predictions = (probabilities >= self.threshold).astype(int)
            
            return pd.DataFrame({
                'prediction': predictions,
                'probability': probabilities,
                'risk_level': ['high' if p >= 0.7 else 'moderate' if p >= self.threshold else 'low' 
                              for p in probabilities]
            })
        except Exception as e:
            print(f"Error in batch prediction: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    def get_feature_importance(self):
        """Get feature importance from the model if available"""
        if hasattr(self.model, 'feature_importances_'):
            importance = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            importance = np.abs(self.model.coef_).flatten()
        else:
            return None
        
        # Create DataFrame with feature names and importance
        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        return importance_df

# Create a singleton instance
try:
    model_loader = ModelLoader()
    print("✅ ModelLoader initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize ModelLoader: {str(e)}")
    model_loader = None