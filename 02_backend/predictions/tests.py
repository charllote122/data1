# prediction/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import Prediction
import json

User = get_user_model()

class PredictionModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.prediction_data = {
            'user': self.user,
            'risk_score': 75.5,
            'risk_level': 'high',
            'input_data': {
                'Age': 55,
                'BMI': 32.5,
                'HighBP': 1,
                'HighChol': 1
            },
            'top_factors': [
                {'feature': 'BMI', 'importance': 0.3, 'value': 32.5}
            ]
        }
    
    def test_create_prediction(self):
        prediction = Prediction.objects.create(**self.prediction_data)
        self.assertEqual(prediction.risk_level, 'high')
        self.assertEqual(prediction.user.username, 'testuser')
        self.assertIsNotNone(prediction.prediction_date)
    
    def test_get_risk_category_color(self):
        prediction = Prediction.objects.create(**self.prediction_data)
        self.assertEqual(prediction.get_risk_category_color(), '#e74c3c')
    
    def test_get_summary(self):
        prediction = Prediction.objects.create(**self.prediction_data)
        summary = prediction.get_summary()
        self.assertEqual(summary['risk_level'], 'high')
        self.assertEqual(summary['risk_score'], 75.5)

class PredictionAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.valid_payload = {
            'Age': 45,
            'Sex': 1,
            'BMI': 28.5,
            'HighBP': 1,
            'HighChol': 1,
            'Stroke': 0,
            'HeartDiseaseorAttack': 0,
            'PhysActivity': 1,
            'Fruits': 1,
            'Veggies': 1,
            'Smoker': 1,
            'HvyAlcoholConsump': 0,
            'GenHlth': 3,
            'PhysHlth': 5
        }
    
    def test_create_prediction(self):
        response = self.client.post('/api/predictions/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('risk_level', response.data)
    
    def test_list_predictions(self):
        response = self.client.get('/api/predictions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_prediction_stats(self):
        response = self.client.get('/api/predictions/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)