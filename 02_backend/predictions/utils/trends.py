 
# predictions/utils/trends.py
from django.db.models import Avg
from datetime import timedelta
from ..models import Prediction, UserHealthProfile, Symptom

class HealthTrendsAnalyzer:
    def __init__(self, user):
        self.user = user
    
    def get_risk_trends(self, days=90):
        """Get risk score trends over time"""
        cutoff_date = timezone.now() - timedelta(days=days)
        predictions = Prediction.objects.filter(
            user=self.user,
            prediction_date__gte=cutoff_date
        ).order_by('prediction_date')
        
        return [
            {
                'date': p.prediction_date.date(),
                'risk_score': p.risk_score,
                'risk_level': p.risk_level
            }
            for p in predictions
        ]
    
    def get_bmi_trends(self, days=90):
        """Get BMI trends over time"""
        try:
            profile = UserHealthProfile.objects.get(user=self.user)
            history = profile.bmi_history if profile.bmi_history else []
            return history[-30:]  # Last 30 entries
        except UserHealthProfile.DoesNotExist:
            return []
    
    def get_symptom_trends(self, days=30):
        """Get symptom frequency trends"""
        cutoff_date = timezone.now() - timedelta(days=days)
        symptoms = Symptom.objects.filter(
            user=self.user,
            timestamp__gte=cutoff_date
        ).values('symptom_type').annotate(
            count=Count('id'),
            avg_severity=Avg('severity')
        ).order_by('-count')
        
        return list(symptoms)
    
    def get_improvement_score(self):
        """Calculate overall health improvement score"""
        predictions = Prediction.objects.filter(user=self.user).order_by('-prediction_date')[:2]
        
        if len(predictions) < 2:
            return 0
        
        latest = predictions[0]
        previous = predictions[1]
        
        # Calculate improvement (negative change means risk reduced)
        improvement = (previous.risk_score - latest.risk_score) / previous.risk_score * 100
        
        return round(improvement, 1)