import logging

logger = logging.getLogger(__name__)

def validate_patient_data(patient_data, expected_features):
    """
    Validate patient input data
    """
    try:
        # Check if data is dict
        if not isinstance(patient_data, dict):
            return False, "Patient data must be a dictionary"
        
        # Check for required features
        required_features = ['HighBP', 'HighChol', 'BMI', 'Age']
        missing = [f for f in required_features if f not in patient_data]
        if missing:
            return False, f"Missing required features: {missing}"
        
        # Validate data types and ranges
        for feature, value in patient_data.items():
            if feature not in expected_features:
                logger.warning(f"Unknown feature: {feature}")
                continue
            
            # Binary features (0 or 1)
            if feature in ['HighBP', 'HighChol', 'CholCheck', 'Smoker', 'Stroke', 
                          'HeartDiseaseorAttack', 'PhysActivity', 'Fruits', 'Veggies',
                          'HvyAlcoholConsump', 'AnyHealthcare', 'NoDocbcCost', 
                          'DiffWalk', 'Sex']:
                if value not in [0, 1, 0.0, 1.0]:
                    return False, f"{feature} must be 0 or 1"
            
            # BMI validation
            elif feature == 'BMI':
                if not isinstance(value, (int, float)) or value < 10 or value > 100:
                    return False, "BMI must be between 10 and 100"
            
            # Age validation
            elif feature == 'Age':
                if not isinstance(value, (int, float)) or value < 18 or value > 120:
                    return False, "Age must be between 18 and 120"
        
        return True, "Valid"
        
    except Exception as e:
        return False, str(e)


def format_patient_data(raw_data):
    """
    Format raw input data to match expected features
    """
    formatted = {}
    
    # Map common names to feature names
    mappings = {
        'blood_pressure': 'HighBP',
        'cholesterol': 'HighChol',
        'bmi': 'BMI',
        'age': 'Age',
        'smoking': 'Smoker',
        'physical_activity': 'PhysActivity',
        'fruits': 'Fruits',
        'veggies': 'Veggies',
        'alcohol': 'HvyAlcoholConsump',
        'sex': 'Sex',
        'gender': 'Sex',
        'education': 'Education',
        'income': 'Income',
        'general_health': 'GenHlth',
        'mental_health': 'MentHlth',
        'physical_health': 'PhysHlth'
    }
    
    for key, value in raw_data.items():
        # Try direct match
        if key in mappings.values():
            formatted[key] = value
        # Try mapped match
        elif key.lower() in mappings:
            formatted[mappings[key.lower()]] = value
    
    return formatted
