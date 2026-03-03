  
# predictions/utils/reports.py
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.utils import timezone
import matplotlib.pyplot as plt
import io
import base64
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import logging

logger = logging.getLogger(__name__)

def generate_risk_chart(prediction):
    """Generate a risk factor chart as base64 image"""
    try:
        plt.figure(figsize=(8, 4))
        
        if prediction.top_factors:
            factors = [f['feature'][:20] for f in prediction.top_factors[:5]]
            importance = [f['importance'] for f in prediction.top_factors[:5]]
            
            plt.barh(factors, importance, color=['#e74c3c' if i < 2 else '#f39c12' for i in range(len(importance))])
            plt.xlabel('Importance')
            plt.title('Top Risk Factors')
            plt.tight_layout()
        else:
            plt.text(0.5, 0.5, 'No factor data available', ha='center', va='center')
        
        # Convert plot to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    except Exception as e:
        logger.error(f"Error generating chart: {e}")
        return None

def generate_pdf_report(user, prediction):
    """
    Generate PDF report for a prediction
    """
    try:
        # Create a file-like buffer to receive PDF data
        buffer = io.BytesIO()
        
        # Create the PDF object
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
        )
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Get styles
        styles = getSampleStyleSheet()
        title_style = styles['Heading1']
        heading_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Custom styles
        center_style = ParagraphStyle(
            'Center',
            parent=styles['Normal'],
            alignment=TA_CENTER,
            fontSize=12,
            spaceAfter=12
        )
        
        # Title
        elements.append(Paragraph("Diabetes Risk Assessment Report", styles['Title']))
        elements.append(Spacer(1, 0.25*inch))
        
        # Date and user info
        elements.append(Paragraph(f"Date: {timezone.now().strftime('%B %d, %Y')}", normal_style))
        elements.append(Paragraph(f"User: {user.get_full_name() or user.username}", normal_style))
        elements.append(Paragraph(f"Email: {user.email}", normal_style))
        elements.append(Spacer(1, 0.25*inch))
        
        # Risk Summary
        elements.append(Paragraph("Risk Summary", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        risk_color = '#e74c3c' if prediction.risk_level == 'high' else '#f39c12' if prediction.risk_level == 'moderate' else '#2ecc71'
        risk_text = f'<font color="{risk_color}"><b>{prediction.risk_level.upper()}</b></font>'
        elements.append(Paragraph(f"Risk Level: {risk_text}", normal_style))
        elements.append(Paragraph(f"Risk Score: {prediction.risk_score:.1f}%", normal_style))
        elements.append(Spacer(1, 0.25*inch))
        
        # Top Factors
        elements.append(Paragraph("Top Risk Factors", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        if prediction.top_factors:
            data = [['Factor', 'Value', 'Importance']]
            for factor in prediction.top_factors[:5]:
                data.append([
                    factor.get('feature', 'Unknown'),
                    str(factor.get('value', 'N/A')),
                    f"{factor.get('importance', 0):.3f}"
                ])
            
            table = Table(data, colWidths=[2.5*inch, 1.5*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(table)
        else:
            elements.append(Paragraph("No factor data available", normal_style))
        
        elements.append(Spacer(1, 0.25*inch))
        
        # Recommendations
        elements.append(Paragraph("Recommendations", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        from .notifications import get_recommendations_from_prediction
        recommendations = get_recommendations_from_prediction(prediction)
        
        for i, rec in enumerate(recommendations, 1):
            elements.append(Paragraph(f"{i}. {rec}", normal_style))
            elements.append(Spacer(1, 0.05*inch))
        
        elements.append(Spacer(1, 0.25*inch))
        
        # Footer
        elements.append(Paragraph("This report is for informational purposes only and not a medical diagnosis.", center_style))
        elements.append(Paragraph("Please consult with a healthcare provider for medical advice.", center_style))
        
        # Build PDF
        doc.build(elements)
        
        # Get the value of the BytesIO buffer
        pdf = buffer.getvalue()
        buffer.close()
        
        return pdf
        
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        return None
    # predictions/utils/reports.py
import csv
import json
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

class ReportGenerator:
    @staticmethod
    def generate_csv_report(user, start_date=None, end_date=None):
        """Generate CSV report of user's health data"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{user.username}_health_report.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Date', 'Risk Score', 'Risk Level', 'BMI', 'Weight', 'Notes'])
        
        predictions = Prediction.objects.filter(user=user)
        if start_date:
            predictions = predictions.filter(prediction_date__gte=start_date)
        if end_date:
            predictions = predictions.filter(prediction_date__lte=end_date)
        
        for pred in predictions:
            writer.writerow([
                pred.prediction_date.date(),
                pred.risk_score,
                pred.risk_level,
                pred.input_data.get('BMI', ''),
                pred.input_data.get('weight', ''),
                pred.user_notes or ''
            ])
        
        return response
    
    @staticmethod
    def generate_pdf_report(user):
        """Generate PDF report"""
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{user.username}_health_report.pdf"'
        
        p = canvas.Canvas(response, pagesize=letter)
        p.setFont("Helvetica", 16)
        p.drawString(100, 750, f"Health Report for {user.username}")
        
        # Add content...
        p.showPage()
        p.save()
        
        return response