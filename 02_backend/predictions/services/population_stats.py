# predictions/services/population_stats.py
import numpy as np
from django.core.exceptions import AppRegistryNotReady
import logging

logger = logging.getLogger(__name__)

class PopulationStats:
    """Service for population statistics"""
    
    def get_stats(self):
        """Get anonymized population statistics"""
        try:
            # Try to import models lazily
            from django.apps import apps
            if apps.ready:
                from ..models import Prediction
                
                # Get all predictions (filter for privacy)
                predictions = Prediction.objects.filter(is_public=True)
                
                if not predictions.exists():
                    return self._get_default_stats()
                
                # Calculate statistics
                stats = {
                    'total_predictions': predictions.count(),
                    'average_risk': predictions.aggregate(Avg('probability'))['probability__avg'],
                    'risk_distribution': {
                        'low': predictions.filter(result='LOW').count(),
                        'moderate': predictions.filter(result='MODERATE').count(),
                        'high': predictions.filter(result='HIGH').count(),
                    }
                }
                
                return stats
            else:
                logger.warning("Apps not ready yet, returning default stats")
                return self._get_default_stats()
            
        except (AppRegistryNotReady, ImportError) as e:
            logger.warning(f"Database not ready: {str(e)}")
            return self._get_default_stats()
        except Exception as e:
            logger.error(f"Error getting population stats: {str(e)}")
            return self._get_default_stats()
    
    def _get_default_stats(self):
        """Return default statistics when no data available"""
        return {
            'total_predictions': 0,
            'average_risk': 0.3,
            'risk_distribution': {'low': 0, 'moderate': 0, 'high': 0}
        }


population_stats = PopulationStats()