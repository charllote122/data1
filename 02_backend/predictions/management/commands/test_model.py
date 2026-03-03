"""
Django management command to test the model loader
Run with: python manage.py test_model
"""
from django.core.management.base import BaseCommand
from predictions.model_loader import model_loader
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Test the model loader with sample data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Testing model loader...'))
        
        # Get model info
        info = model_loader.get_model_info()
        self.stdout.write(f"Model: {info['model_name']}")
        self.stdout.write(f"F1 Score: {info['f1_score']}")
        self.stdout.write(f"ROC-AUC: {info['roc_auc']}")
        self.stdout.write(f"Features: {info['features_count']}")
        
        # Test prediction with sample data
        test_data = {
            'HighBP': 1,
            'HighChol': 1,
            'CholCheck': 1,
            'BMI': 32.5,
            'Smoker': 1,
            'Stroke': 0,
            'HeartDiseaseorAttack': 0,
            'PhysActivity': 0,
            'Fruits': 0,
            'Veggies': 0,
            'HvyAlcoholConsump': 0,
            'AnyHealthcare': 1,
            'NoDocbcCost': 0,
            'GenHlth': 4,
            'MentHlth': 5,
            'PhysHlth': 7,
            'DiffWalk': 0,
            'Sex': 1,
            'Age': 65,
            'Education': 4,
            'Income': 6
        }
        
        try:
            result = model_loader.predict(test_data)
            self.stdout.write(self.style.SUCCESS('\nPrediction Result:'))
            self.stdout.write(f"  Risk Score: {result['risk_score']:.1f}%")
            self.stdout.write(f"  Risk Level: {result['risk_level']}")
            self.stdout.write(f"  Probability: {result['probability']:.3f}")
            self.stdout.write(f"  Threshold: {result['threshold_used']:.3f}")
            
            if result['risk_level'] == 'high':
                self.stdout.write(self.style.WARNING('  This indicates HIGH risk'))
            elif result['risk_level'] == 'moderate':
                self.stdout.write(self.style.WARNING('  This indicates MODERATE risk'))
            else:
                self.stdout.write(self.style.SUCCESS('  This indicates LOW risk'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS('\nModel test completed!'))