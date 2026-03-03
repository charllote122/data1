# predictions/__init__.py
# Change this:
# from .simulation import RiskSimulator

# To this:
from .services.simulation import RiskSimulator
from .services.population_stats import population_stats

__all__ = ['RiskSimulator', 'population_stats']