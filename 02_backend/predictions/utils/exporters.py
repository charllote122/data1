 
# predictions/utils/exporters.py
import csv
import json
import pandas as pd
from django.http import HttpResponse
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def export_to_csv(predictions, user):
    """
    Export predictions to CSV format
    """
    try:
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="diabetes_predictions_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'Date', 'Risk Level', 'Risk Score (%)', 'Top Factors', 
            'BMI', 'Age', 'HighBP', 'HighChol', 'Smoker', 'PhysActivity'
        ])
        
        # Write data
        for pred in predictions:
            input_data = pred.input_data or {}
            top_factors_str = ', '.join([f.get('feature', '') for f in (pred.top_factors or [])[:3]])
            
            writer.writerow([
                pred.prediction_date.strftime('%Y-%m-%d %H:%M'),
                pred.risk_level.upper(),
                f"{pred.risk_score:.1f}",
                top_factors_str,
                input_data.get('BMI', 'N/A'),
                input_data.get('Age', 'N/A'),
                'Yes' if input_data.get('HighBP') else 'No',
                'Yes' if input_data.get('HighChol') else 'No',
                'Yes' if input_data.get('Smoker') else 'No',
                'Yes' if input_data.get('PhysActivity') else 'No',
            ])
        
        logger.info(f"Exported {predictions.count()} predictions to CSV for user {user.username}")
        return response
        
    except Exception as e:
        logger.error(f"Error exporting to CSV: {e}")
        return None


def export_to_json(predictions, user):
    """
    Export predictions to JSON format
    """
    try:
        data = []
        for pred in predictions:
            data.append({
                'id': pred.id,
                'date': pred.prediction_date.isoformat(),
                'risk_level': pred.risk_level,
                'risk_score': pred.risk_score,
                'threshold_used': pred.threshold_used,
                'top_factors': pred.top_factors,
                'input_data': pred.input_data,
                'feedback': pred.user_feedback,
                'notes': pred.user_notes
            })
        
        response = HttpResponse(content_type='application/json')
        response['Content-Disposition'] = f'attachment; filename="diabetes_predictions_{timezone.now().strftime("%Y%m%d")}.json"'
        
        json.dump({
            'user': user.username,
            'email': user.email,
            'export_date': timezone.now().isoformat(),
            'total_predictions': len(data),
            'predictions': data
        }, response, indent=2)
        
        logger.info(f"Exported {predictions.count()} predictions to JSON for user {user.username}")
        return response
        
    except Exception as e:
        logger.error(f"Error exporting to JSON: {e}")
        return None


def export_to_excel(predictions, user):
    """
    Export predictions to Excel format
    """
    try:
        # Create DataFrame
        rows = []
        for pred in predictions:
            input_data = pred.input_data or {}
            rows.append({
                'Date': pred.prediction_date,
                'Risk Level': pred.risk_level.upper(),
                'Risk Score (%)': pred.risk_score,
                'Top Factors': ', '.join([f.get('feature', '') for f in (pred.top_factors or [])[:3]]),
                'BMI': input_data.get('BMI'),
                'Age': input_data.get('Age'),
                'HighBP': input_data.get('HighBP'),
                'HighChol': input_data.get('HighChol'),
                'Smoker': input_data.get('Smoker'),
                'PhysActivity': input_data.get('PhysActivity'),
                'Fruits': input_data.get('Fruits'),
                'Veggies': input_data.get('Veggies'),
                'GenHlth': input_data.get('GenHlth'),
            })
        
        df = pd.DataFrame(rows)
        
        # Create response
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="diabetes_predictions_{timezone.now().strftime("%Y%m%d")}.xlsx"'
        
        # Write to Excel
        with pd.ExcelWriter(response, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Predictions', index=False)
        
        logger.info(f"Exported {predictions.count()} predictions to Excel for user {user.username}")
        return response
        
    except Exception as e:
        logger.error(f"Error exporting to Excel: {e}")
        return None