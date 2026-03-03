"""
Test script for Explainable AI (XAI) functionality with Django integration
Tests SHAP, LIME, and feature importance explanations
"""

import sys
import os
import django
import json
import numpy as np
import pandas as pd
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Now import Django models and other modules
from predictions.model_loader import model_loader
from predictions.models import Prediction
from django.contrib.auth import get_user_model

User = get_user_model()

# Try to import XAI libraries
try:
    import shap
    SHAP_AVAILABLE = True
    print("✓ SHAP library loaded")
except ImportError:
    SHAP_AVAILABLE = False
    print("✗ SHAP not installed. Run: pip install shap")

try:
    import lime
    import lime.lime_tabular
    LIME_AVAILABLE = True
    print("✓ LIME library loaded")
except ImportError:
    LIME_AVAILABLE = False
    print("✗ LIME not installed. Run: pip install lime")

try:
    import matplotlib.pyplot as plt
    PLOT_AVAILABLE = True
except ImportError:
    PLOT_AVAILABLE = False
    print("✗ Matplotlib not installed. Run: pip install matplotlib")

import warnings
warnings.filterwarnings('ignore')


def check_model_files():
    """Check if model files exist in the correct location"""
    from pathlib import Path
    
    # Get the base directory - fix the path
    base_dir = Path(__file__).resolve().parent
    model_path = base_dir / 'predictions' / 'models'
    
    # Try alternative path if not found
    if not model_path.exists():
        model_path = base_dir / '02_backend' / 'predictions' / 'models'
    
    print("\n🔍 Checking model files...")
    print(f"Model directory: {model_path}")
    
    required_files = ['best_model.pkl', 'scaler.pkl', 'feature_names.json', 'optimal_threshold.txt']
    all_files_exist = True
    
    for file in required_files:
        file_path = model_path / file
        if file_path.exists():
            size = file_path.stat().st_size
            print(f"✅ {file}: {size:,} bytes")
        else:
            print(f"❌ {file}: NOT FOUND")
            all_files_exist = False
    
    return all_files_exist


def test_prediction_with_xai():
    """Test prediction with full XAI explanations"""
    
    print("\n" + "="*60)
    print("TESTING PREDICTION WITH XAI EXPLANATIONS")
    print("="*60)
    
    # Sample patient data (using your actual feature set)
    patient = {
        'Age': 55,
        'Sex': 1,
        'BMI': 32.5,
        'HighBP': 1,
        'HighChol': 1,
        'Stroke': 0,
        'HeartDiseaseorAttack': 0,
        'PhysActivity': 0,
        'Fruits': 0,
        'Veggies': 0,
        'Smoker': 1,
        'HvyAlcoholConsump': 0,
        'GenHlth': 4,
        'PhysHlth': 15
    }
    
    # Add any missing features if model_loader has feature_names
    if hasattr(model_loader, 'feature_names') and model_loader.feature_names:
        print(f"\n📋 Model expects {len(model_loader.feature_names)} features")
        # Ensure all features are present
        for feature in model_loader.feature_names:
            if feature not in patient:
                patient[feature] = 0
                print(f"   Added missing feature '{feature}' with default value 0")
    
    print("\n📊 Patient Data (first 10 features):")
    for i, (key, value) in enumerate(sorted(patient.items())):
        if i < 10:
            print(f"   {key}: {value}")
    if len(patient) > 10:
        print(f"   ... and {len(patient)-10} more features")
    
    # Check if model_loader is available
    if model_loader is None:
        print("\n❌ ModelLoader not initialized.")
        return None
    
    # Check if model is loaded
    if not hasattr(model_loader, 'model') or model_loader.model is None:
        print("\n⚠️ Model not loaded. Attempting to load...")
        if hasattr(model_loader, 'load_models'):
            model_loader.load_models()
    
    # Get prediction with explanations
    print("\n🔮 Getting prediction with XAI explanations...")
    
    try:
        # Check if predict_with_explanation method exists
        if hasattr(model_loader, 'predict_with_explanation'):
            result = model_loader.predict_with_explanation(patient)
        else:
            # Fallback to manual prediction
            print("⚠️ predict_with_explanation method not found. Using manual prediction...")
            result = manual_prediction_with_explanations(patient)
        
        if not result:
            print("❌ Failed to get prediction")
            return None
        
        print(f"\n✅ Prediction Result:")
        print(f"   Risk Level: {result.get('risk_level', 'N/A').upper()}")
        print(f"   Risk Score: {result.get('probability', 0)*100:.2f}%")
        print(f"   Prediction: {result.get('prediction', 'N/A')}")
        print(f"   Threshold Used: {result.get('threshold_used', 0.5):.3f}")
        
        print("\n📈 Top Contributing Factors:")
        if result.get('top_factors'):
            for i, factor in enumerate(result['top_factors'][:5], 1):
                print(f"   {i}. {factor.get('feature', 'Unknown')}:")
                print(f"      Value: {factor.get('value', 'N/A')}")
                print(f"      Importance: {factor.get('importance', 0):.3f}")
                impact = factor.get('contribution', factor.get('impact', 'neutral'))
                print(f"      {impact.capitalize()}")
        else:
            print("   No top factors available")
        
        print("\n🔬 SHAP Values:")
        if result.get('shap_values'):
            shap_data = result['shap_values']
            if isinstance(shap_data, dict):
                if 'contributions' in shap_data:
                    for i, contrib in enumerate(shap_data['contributions'][:5], 1):
                        impact_icon = "⬆️" if contrib.get('shap_value', 0) > 0 else "⬇️"
                        print(f"   {i}. {contrib.get('feature', 'Unknown')}: {impact_icon} SHAP={contrib.get('shap_value', 0):.3f}")
                elif 'error' in shap_data:
                    print(f"   Note: {shap_data['error']}")
                else:
                    print(f"   SHAP data available")
            else:
                print(f"   SHAP data available: {type(shap_data)}")
        else:
            print("   No SHAP data available")
        
        print("\n🧪 LIME Explanation:")
        if result.get('lime_explanation'):
            lime_data = result['lime_explanation']
            if isinstance(lime_data, dict):
                if 'factors' in lime_data:
                    for i, factor in enumerate(lime_data['factors'][:5], 1):
                        direction = "+" if factor.get('importance', 0) > 0 else "-"
                        print(f"   {i}. {factor.get('feature', 'Unknown')}: {direction}{abs(factor.get('importance', 0)):.3f}")
                elif 'error' in lime_data:
                    print(f"   Note: {lime_data['error']}")
            else:
                print(f"   LIME data available")
        else:
            print("   No LIME data available")
        
        # Save results to file
        output_file = Path(__file__).parent / 'xai_test_results.json'
        with open(output_file, 'w') as f:
            # Convert numpy types to Python types for JSON serialization
            json_compatible_result = convert_to_serializable(result)
            json.dump(json_compatible_result, f, indent=2)
        print(f"\n💾 Results saved to: {output_file}")
        
        return result
        
    except Exception as e:
        print(f"\n❌ Error during prediction: {e}")
        import traceback
        traceback.print_exc()
        return None


def manual_prediction_with_explanations(patient_data):
    """Manual prediction with explanations (fallback method)"""
    print("   Using manual prediction fallback...")
    
    result = {
        'patient_data': patient_data,
        'timestamp': str(pd.Timestamp.now()),
        'success': False
    }
    
    try:
        # Make prediction using model_loader
        if model_loader and hasattr(model_loader, 'model') and model_loader.model and hasattr(model_loader, 'scaler') and model_loader.scaler:
            # Convert to DataFrame
            import pandas as pd
            input_df = pd.DataFrame([patient_data])
            
            # Ensure correct feature order
            if hasattr(model_loader, 'feature_names') and model_loader.feature_names:
                # Check if all features are present
                missing_features = [f for f in model_loader.feature_names if f not in input_df.columns]
                if missing_features:
                    print(f"   Warning: Missing features: {missing_features}")
                    # Add missing features with default values
                    for feat in missing_features:
                        input_df[feat] = 0
                
                # Reorder columns to match feature_names
                input_df = input_df[model_loader.feature_names]
            
            # Scale features
            input_scaled = model_loader.scaler.transform(input_df)
            
            # Get prediction
            prediction = model_loader.model.predict(input_scaled)[0]
            
            # Get probability
            if hasattr(model_loader.model, 'predict_proba'):
                probabilities = model_loader.model.predict_proba(input_scaled)[0]
                probability = probabilities[1] if len(probabilities) > 1 else probabilities[0]
            else:
                probability = float(prediction)
            
            # Determine risk level
            threshold = getattr(model_loader, 'optimal_threshold', 0.5)
            if hasattr(model_loader, 'threshold'):
                threshold = model_loader.threshold
            risk_level = 'high' if probability >= threshold else 'low'
            if probability >= threshold * 1.2:
                risk_level = 'high'
            elif probability >= threshold * 0.8:
                risk_level = 'moderate'
            else:
                risk_level = 'low'
            
            # Simple feature importance (using coefficients if available)
            top_factors = []
            if hasattr(model_loader.model, 'coef_'):
                coef = model_loader.model.coef_[0]
                features = list(patient_data.keys())
                for i, (feat, imp) in enumerate(zip(features, coef)):
                    if feat in patient_data:
                        top_factors.append({
                            'feature': feat,
                            'value': patient_data[feat],
                            'importance': float(abs(imp)),
                            'contribution': 'increases risk' if imp > 0 else 'decreases risk'
                        })
                # Sort by importance
                top_factors.sort(key=lambda x: x['importance'], reverse=True)
            
            result.update({
                'prediction': int(prediction),
                'probability': float(probability),
                'risk_level': risk_level,
                'threshold_used': float(threshold),
                'top_factors': top_factors[:10],
                'success': True
            })
        else:
            result['error'] = "Model or scaler not loaded"
            print(f"   Error: {result['error']}")
            
    except Exception as e:
        result['error'] = str(e)
        print(f"   Error in manual prediction: {e}")
    
    return result


def convert_to_serializable(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if obj is None:
        return None
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(item) for item in obj]
    elif hasattr(obj, 'isoformat'):  # For datetime objects
        return obj.isoformat()
    else:
        return obj


def test_multiple_patients():
    """Test multiple patient profiles"""
    
    patients = [
        {
            'name': 'High Risk Patient',
            'data': {
                'Age': 65, 'Sex': 1, 'BMI': 35.0, 'HighBP': 1, 'HighChol': 1,
                'Stroke': 0, 'HeartDiseaseorAttack': 1, 'PhysActivity': 0,
                'Fruits': 0, 'Veggies': 0, 'Smoker': 1, 'HvyAlcoholConsump': 0,
                'GenHlth': 5, 'PhysHlth': 25
            }
        },
        {
            'name': 'Moderate Risk Patient',
            'data': {
                'Age': 45, 'Sex': 0, 'BMI': 28.0, 'HighBP': 1, 'HighChol': 0,
                'Stroke': 0, 'HeartDiseaseorAttack': 0, 'PhysActivity': 1,
                'Fruits': 1, 'Veggies': 1, 'Smoker': 0, 'HvyAlcoholConsump': 0,
                'GenHlth': 3, 'PhysHlth': 5
            }
        },
        {
            'name': 'Low Risk Patient',
            'data': {
                'Age': 30, 'Sex': 0, 'BMI': 22.0, 'HighBP': 0, 'HighChol': 0,
                'Stroke': 0, 'HeartDiseaseorAttack': 0, 'PhysActivity': 1,
                'Fruits': 1, 'Veggies': 1, 'Smoker': 0, 'HvyAlcoholConsump': 0,
                'GenHlth': 1, 'PhysHlth': 0
            }
        }
    ]
    
    print("\n" + "="*60)
    print("TESTING MULTIPLE PATIENT PROFILES")
    print("="*60)
    
    all_results = []
    
    for patient in patients:
        print(f"\n{'#'*40}")
        print(f"PATIENT: {patient['name']}")
        print(f"{'#'*40}")
        
        print("\nPatient Data:")
        for key, value in patient['data'].items():
            print(f"  {key}: {value}")
        
        try:
            if hasattr(model_loader, 'predict_with_explanation'):
                result = model_loader.predict_with_explanation(patient['data'])
            else:
                result = manual_prediction_with_explanations(patient['data'])
            
            if result:
                print(f"\nResults:")
                print(f"  Risk Level: {result.get('risk_level', 'N/A').upper()}")
                print(f"  Risk Score: {result.get('probability', 0)*100:.2f}%")
                print(f"  Prediction: {result.get('prediction', 'N/A')}")
                
                if result.get('top_factors'):
                    print("  Top Factors:")
                    for factor in result['top_factors'][:3]:
                        print(f"    - {factor.get('feature', 'Unknown')}: {factor.get('importance', 0):.3f}")
                
                # Add patient name to result
                result['patient_name'] = patient['name']
                all_results.append(result)
            else:
                print(f"  Failed to get prediction")
            
        except Exception as e:
            print(f"  Error: {e}")
    
    # Save all results
    if all_results:
        output_file = Path(__file__).parent / 'xai_multiple_patients_results.json'
        with open(output_file, 'w') as f:
            json.dump(convert_to_serializable(all_results), f, indent=2)
        print(f"\n💾 All results saved to: {output_file}")
    
    print("\n" + "="*60)
    return all_results


def test_database_integration():
    """Test saving predictions to database"""
    print("\n" + "="*60)
    print("TESTING DATABASE INTEGRATION")
    print("="*60)
    
    try:
        from predictions.models import Prediction
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Create a test user if none exists
        user, created = User.objects.get_or_create(
            username='test_user',
            defaults={'email': 'test@example.com'}
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"✅ Created test user: {user.username}")
        
        # Sample patient data
        patient_data = {
            'Age': 55,
            'Sex': 1,
            'BMI': 32.5,
            'HighBP': 1,
            'HighChol': 1,
            'Stroke': 0,
            'HeartDiseaseorAttack': 0,
            'PhysActivity': 0,
            'Fruits': 0,
            'Veggies': 0,
            'Smoker': 1,
            'HvyAlcoholConsump': 0,
            'GenHlth': 4,
            'PhysHlth': 15
        }
        
        # Get prediction
        if hasattr(model_loader, 'predict_with_explanation'):
            result = model_loader.predict_with_explanation(patient_data)
        else:
            result = manual_prediction_with_explanations(patient_data)
        
        if not result:
            print("❌ Failed to get prediction")
            return None
        
        # Get the actual model fields
        prediction_fields = [f.name for f in Prediction._meta.get_fields()]
        print(f"\n📋 Prediction model fields: {prediction_fields}")
        
        # Check if Patient model exists and is required
        from predictions.models import Patient
        patient_exists = 'patient' in prediction_fields
        
        if patient_exists:
            # Create a patient record
            patient = Patient.objects.create(
                user=user,
                age=patient_data['Age'],
                sex=patient_data['Sex'],
                bmi=patient_data['BMI'],
                high_bp=bool(patient_data['HighBP']),
                high_chol=bool(patient_data['HighChol']),
                stroke=bool(patient_data['Stroke']),
                heart_disease=bool(patient_data['HeartDiseaseorAttack']),
                phys_activity=bool(patient_data['PhysActivity']),
                fruits=bool(patient_data['Fruits']),
                veggies=bool(patient_data['Veggies']),
                smoker=bool(patient_data['Smoker']),
                heavy_alcohol=bool(patient_data['HvyAlcoholConsump']),
                gen_health=patient_data['GenHlth'],
                phys_health_days=patient_data['PhysHlth']
            )
            print(f"✅ Created patient record: {patient.id}")
            
            # Create prediction with patient relationship
            prediction_data = {
                'patient': patient,
                'prediction': result.get('prediction', 0),
                'probability': result.get('probability', 0),
                'risk_level': result.get('risk_level', 'low'),
                'explanation_data': result,
                'top_factors': result.get('top_factors', [])
            }
        else:
            # Create prediction with user relationship
            prediction_data = {
                'user': user,
                'risk_score': result.get('probability', 0) * 100,
                'risk_level': result.get('risk_level', 'low'),
                'input_data': patient_data,
                'shap_values': result.get('shap_values'),
                'top_factors': result.get('top_factors', []),
                'lime_explanation': result.get('lime_explanation'),
                'model_version': result.get('model_version', '1.0')
            }
        
        # Filter to only include fields that exist in the model
        valid_prediction_data = {}
        for key, value in prediction_data.items():
            if key in prediction_fields:
                valid_prediction_data[key] = value
                print(f"   Adding field '{key}'")
        
        # Create the prediction
        prediction = Prediction(**valid_prediction_data)
        prediction.save()
        print(f"✅ Created prediction record: {prediction.id}")
        
        # Verify
        print(f"\nVerification:")
        print(f"  Predictions in DB: {Prediction.objects.count()} total predictions")
        print(f"  Latest prediction ID: {prediction.id}")
        print(f"  Risk Level: {prediction.risk_level}")
        
        # Show available attributes
        if hasattr(prediction, 'probability'):
            print(f"  Probability: {prediction.probability:.2%}")
        if hasattr(prediction, 'risk_score'):
            print(f"  Risk Score: {prediction.risk_score:.2f}%")
        if hasattr(prediction, 'prediction'):
            print(f"  Prediction: {prediction.prediction}")
        
        return prediction
        
    except Exception as e:
        print(f"❌ Database integration error: {e}")
        import traceback
        traceback.print_exc()
        return None

def create_xai_visualizations():
    """Create visualizations for XAI explanations"""
    print("\n" + "="*60)
    print("CREATING XAI VISUALIZATIONS")
    print("="*60)
    
    if not PLOT_AVAILABLE:
        print("❌ Matplotlib not available. Skipping visualizations.")
        return
    
    try:
        # Sample patient data
        patient_data = {
            'Age': 55,
            'Sex': 1,
            'BMI': 32.5,
            'HighBP': 1,
            'HighChol': 1,
            'Stroke': 0,
            'HeartDiseaseorAttack': 0,
            'PhysActivity': 0,
            'Fruits': 0,
            'Veggies': 0,
            'Smoker': 1,
            'HvyAlcoholConsump': 0,
            'GenHlth': 4,
            'PhysHlth': 15
        }
        
        # Get prediction with explanations
        if hasattr(model_loader, 'predict_with_explanation'):
            result = model_loader.predict_with_explanation(patient_data)
        else:
            result = manual_prediction_with_explanations(patient_data)
        
        if not result:
            print("❌ Failed to get prediction for visualization")
            return
        
        # Create feature importance plot
        if result.get('top_factors'):
            plt.figure(figsize=(10, 6))
            
            factors = result['top_factors'][:8]  # Top 8 factors
            features = [f.get('feature', 'Unknown') for f in factors]
            importance = [f.get('importance', 0) for f in factors]
            colors = ['red' if f.get('contribution', '').startswith('increase') else 'green' for f in factors]
            
            plt.barh(features, importance, color=colors)
            plt.xlabel('Importance')
            plt.title('Top Factors Influencing Prediction')
            plt.tight_layout()
            
            # Save plot
            plot_path = Path(__file__).parent / 'feature_importance_plot.png'
            plt.savefig(plot_path, dpi=100, bbox_inches='tight')
            plt.close()
            print(f"✅ Feature importance plot saved: {plot_path}")
        
        # Create risk gauge chart
        plt.figure(figsize=(8, 4))
        risk_score = result.get('probability', 0) * 100
        
        # Create a simple gauge
        plt.barh([0], [risk_score], color='red' if risk_score > 50 else 'green', alpha=0.7)
        plt.barh([0], [100-risk_score], left=[risk_score], color='lightgray', alpha=0.3)
        plt.xlim(0, 100)
        plt.ylim(-1, 1)
        plt.yticks([])
        plt.xlabel('Risk Score (%)')
        plt.title(f"Diabetes Risk: {risk_score:.1f}%")
        plt.text(risk_score/2, 0, f'{risk_score:.1f}%', ha='center', va='center', fontsize=14, fontweight='bold')
        
        # Save plot
        gauge_path = Path(__file__).parent / 'risk_gauge.png'
        plt.savefig(gauge_path, dpi=100, bbox_inches='tight')
        plt.close()
        print(f"✅ Risk gauge saved: {gauge_path}")
        
    except Exception as e:
        print(f"❌ Error creating visualizations: {e}")


if __name__ == "__main__":
    print("🔍 TESTING XAI IMPLEMENTATION WITH DJANGO")
    print("="*60)
    print(f"Python: {sys.version}")
    print(f"Django: {django.get_version()}")
    print(f"SHAP Available: {SHAP_AVAILABLE}")
    print(f"LIME Available: {LIME_AVAILABLE}")
    print(f"Matplotlib Available: {PLOT_AVAILABLE}")
    
    # Check model files first
    files_exist = check_model_files()
    
    # Check if model_loader is available
    if model_loader is None:
        print("\n❌ ModelLoader not initialized. Check model files.")
        print(f"Model loader: {model_loader}")
    else:
        print(f"\n✅ ModelLoader initialized")
        # Check if model is loaded by checking attributes
        model_loaded = hasattr(model_loader, 'model') and model_loader.model is not None
        print(f"Model loaded: {model_loaded}")
        if model_loaded:
            print(f"Model type: {type(model_loader.model).__name__}")
        if hasattr(model_loader, 'feature_names'):
            print(f"Features: {len(model_loader.feature_names)}")
        if hasattr(model_loader, 'threshold'):
            print(f"Threshold: {model_loader.threshold:.3f}")
    
    # Run tests
    if files_exist:
        test_prediction_with_xai()
        test_multiple_patients()
        test_database_integration()
        create_xai_visualizations()
    else:
        print("\n⚠️ Some model files are missing. Running limited tests...")
        test_prediction_with_xai()
    
    print("\n" + "="*60)
    print("✅ ALL TESTS COMPLETED!")
    print("="*60)