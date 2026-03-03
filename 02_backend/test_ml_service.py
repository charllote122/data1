#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test script for ML Service
Run this with: python test_ml_service.py
"""

from ml_service.predictor import get_predictor
import json
import sys

def main():
    print("=" * 60)
    print("TESTING DIABETES PREDICTION SERVICE")
    print("=" * 60)
    
    try:
        # Initialize predictor
        print("\n[INIT] Initializing predictor...")
        predictor = get_predictor()
        print("[OK] Predictor initialized successfully!")
        
        # Show model info
        model_info = predictor.get_model_info()
        print("\n[MODEL] Information:")
        print(f"  - Model: {model_info.get('name', 'Unknown')}")
        print(f"  - Version: {model_info.get('version', 'Unknown')}")
        print(f"  - F1 Score: {model_info.get('f1_score', 'N/A')}")
        print(f"  - Features: {model_info.get('n_features', 0)}")
        
        # Test Case 1: High Risk Patient
        print("\n" + "-" * 40)
        print("TEST CASE 1: High Risk Patient")
        print("-" * 40)
        
        high_risk = {
            'HighBP': 1,
            'HighChol': 1,
            'BMI': 38,
            'Smoker': 1,
            'Age': 72,
            'Stroke': 1,
            'HeartDiseaseorAttack': 1,
            'PhysActivity': 0,
            'Fruits': 0,
            'Veggies': 0,
            'GenHlth': 5,
            'MentHlth': 20,
            'PhysHlth': 25,
            'DiffWalk': 1,
            'Sex': 1,
            'Education': 2,
            'Income': 2
        }
        
        print("Input:", json.dumps(high_risk, indent=2))
        result = predictor.predict(high_risk)
        print("\nResult:", json.dumps(result, indent=2))
        
        # Test Case 2: Moderate Risk Patient
        print("\n" + "-" * 40)
        print("TEST CASE 2: Moderate Risk Patient")
        print("-" * 40)
        
        moderate_risk = {
            'HighBP': 1,
            'HighChol': 0,
            'BMI': 28,
            'Smoker': 0,
            'Age': 55,
            'Stroke': 0,
            'HeartDiseaseorAttack': 0,
            'PhysActivity': 1,
            'Fruits': 1,
            'Veggies': 1,
            'GenHlth': 3,
            'MentHlth': 5,
            'PhysHlth': 3,
            'DiffWalk': 0,
            'Sex': 0,
            'Education': 4,
            'Income': 6
        }
        
        print("Input:", json.dumps(moderate_risk, indent=2))
        result = predictor.predict(moderate_risk)
        print("\nResult:", json.dumps(result, indent=2))
        
        # Test Case 3: Low Risk Patient
        print("\n" + "-" * 40)
        print("TEST CASE 3: Low Risk Patient")
        print("-" * 40)
        
        low_risk = {
            'HighBP': 0,
            'HighChol': 0,
            'BMI': 22,
            'Smoker': 0,
            'Age': 32,
            'Stroke': 0,
            'HeartDiseaseorAttack': 0,
            'PhysActivity': 1,
            'Fruits': 1,
            'Veggies': 1,
            'GenHlth': 1,
            'MentHlth': 0,
            'PhysHlth': 0,
            'DiffWalk': 0,
            'Sex': 0,
            'Education': 5,
            'Income': 8
        }
        
        print("Input:", json.dumps(low_risk, indent=2))
        result = predictor.predict(low_risk)
        print("\nResult:", json.dumps(result, indent=2))
        
        print("\n" + "=" * 60)
        print("All tests completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
