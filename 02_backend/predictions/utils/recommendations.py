 
# predictions/utils/recommendations.py
from ..models import HealthTip, Prediction, UserHealthProfile

def generate_recommendations(user):
    """Generate personalized health recommendations"""
    recommendations = []
    
    # Get latest prediction
    latest_prediction = Prediction.objects.filter(user=user).first()
    
    if not latest_prediction:
        return recommendations
    
    # Get health profile
    try:
        health_profile = UserHealthProfile.objects.get(user=user)
    except UserHealthProfile.DoesNotExist:
        health_profile = None
    
    # Get top risk factors from prediction
    top_factors = latest_prediction.top_factors if latest_prediction.top_factors else []
    
    # Generate recommendations based on risk factors
    factor_recommendations = {
        'HighBP': {
            'title': 'Manage Blood Pressure',
            'tips': [
                'Reduce sodium intake',
                'Exercise regularly',
                'Limit alcohol consumption',
                'Manage stress through meditation'
            ]
        },
        'HighChol': {
            'title': 'Lower Cholesterol',
            'tips': [
                'Eat more fiber-rich foods',
                'Choose healthy fats',
                'Exercise at least 30 minutes daily',
                'Consider omega-3 supplements'
            ]
        },
        'BMI': {
            'title': 'Achieve Healthy Weight',
            'tips': [
                'Track your daily calories',
                'Incorporate strength training',
                'Stay hydrated',
                'Get adequate sleep'
            ]
        },
        'Smoker': {
            'title': 'Smoking Cessation',
            'tips': [
                'Consider nicotine replacement therapy',
                'Join a support group',
                'Identify triggers',
                'Try stress-relief alternatives'
            ]
        },
        'PhysActivity': {
            'title': 'Increase Physical Activity',
            'tips': [
                'Aim for 150 minutes weekly',
                'Try different activities',
                'Find an exercise buddy',
                'Track your progress'
            ]
        },
    }
    
    for factor in top_factors[:3]:  # Top 3 factors
        factor_name = factor.get('name')
        if factor_name in factor_recommendations:
            recommendations.append(factor_recommendations[factor_name])
    
    # Add general health tips
    general_tips = HealthTip.objects.filter(
        risk_level=latest_prediction.risk_level
    ).order_by('-views')[:3]
    
    for tip in general_tips:
        recommendations.append({
            'title': tip.title,
            'content': tip.content,
            'category': tip.category
        })
    
    return recommendations