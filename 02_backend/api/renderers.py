"""
Custom renderers for different response formats
Support JSON, CSV, Excel, and more
"""

from rest_framework import renderers
from django.utils import timezone
import json
import csv
import io
import pandas as pd
from django.http import HttpResponse


class JSONRenderer(renderers.JSONRenderer):
    """
    Custom JSON renderer with consistent format
    Wraps all responses in a standard structure
    """
    media_type = 'application/json'
    format = 'json'
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # Get response object
        response = renderer_context.get('response') if renderer_context else None
        
        # Format successful responses
        if response and response.status_code < 400:
            response_data = {
                'success': True,
                'data': data,
                'timestamp': timezone.now().isoformat()
            }
        else:
            # Format error responses
            error_data = data
            if not isinstance(data, dict):
                error_data = {'message': str(data)}
            
            response_data = {
                'success': False,
                'error': error_data,
                'code': response.status_code if response else 500,
                'timestamp': timezone.now().isoformat()
            }
        
        return super().render(response_data, accepted_media_type, renderer_context)


class PrettyJSONRenderer(JSONRenderer):
    """
    Prettified JSON for development
    """
    format = 'pretty-json'
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response_data = super().render(data, accepted_media_type, renderer_context)
        return json.dumps(json.loads(response_data), indent=4).encode('utf-8')


class CSVRenderer(renderers.BaseRenderer):
    """
    CSV renderer for exporting data
    Converts JSON data to CSV format
    """
    media_type = 'text/csv'
    format = 'csv'
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if not data:
            return ''
        
        # Handle paginated data
        if isinstance(data, dict) and 'results' in data:
            data = data['results']
        elif isinstance(data, dict) and 'history' in data:
            data = data['history']
        elif isinstance(data, dict) and 'data' in data:
            data = data['data']
        
        # Convert to list if single object
        if not isinstance(data, list):
            data = [data]
        
        if not data:
            return ''
        
        # Get fieldnames from all items
        fieldnames = set()
        for item in data:
            if isinstance(item, dict):
                fieldnames.update(item.keys())
        fieldnames = sorted(fieldnames)
        
        # Create CSV
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for item in data:
            if isinstance(item, dict):
                # Flatten nested dicts
                row = {}
                for key, value in item.items():
                    if isinstance(value, (dict, list)):
                        row[key] = json.dumps(value)
                    else:
                        row[key] = value
                writer.writerow(row)
        
        return output.getvalue()


class ExcelRenderer(renderers.BaseRenderer):
    """
    Excel renderer for exporting data
    Converts JSON data to Excel format
    """
    media_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    format = 'excel'
    charset = None
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if not data:
            return b''
        
        # Handle paginated data
        if isinstance(data, dict) and 'results' in data:
            data = data['results']
        elif isinstance(data, dict) and 'history' in data:
            data = data['history']
        elif isinstance(data, dict) and 'data' in data:
            data = data['data']
        
        # Convert to list if single object
        if not isinstance(data, list):
            data = [data]
        
        # Create DataFrame
        df = pd.DataFrame(data)
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Data', index=False)
        
        return output.getvalue()


class PDFRenderer(renderers.BaseRenderer):
    """
    PDF renderer placeholder
    Requires additional library (reportlab/weasyprint)
    """
    media_type = 'application/pdf'
    format = 'pdf'
    charset = None
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # This is a placeholder - implement with reportlab or weasyprint
        return b'PDF generation not implemented. Please use CSV or Excel format.'


class XMLRenderer(renderers.XMLRenderer):
    """
    XML renderer with custom formatting
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # Wrap data in root element if needed
        if isinstance(data, dict) and 'success' not in data:
            data = {'response': data}
        return super().render(data, accepted_media_type, renderer_context)


class HTMLRenderer(renderers.TemplateHTMLRenderer):
    """
    HTML renderer for browsable API
    """
    format = 'html'
    template_name = 'api_docs.html'


class YAMLRenderer(renderers.BaseRenderer):
    """
    YAML renderer for configuration export
    """
    media_type = 'application/x-yaml'
    format = 'yaml'
    
    def render(self, data, accepted_media_type=None, renderer_context=None):
        try:
            import yaml
            return yaml.dump(data, default_flow_style=False).encode('utf-8')
        except ImportError:
            return b'PyYAML not installed. Please install with: pip install pyyaml'