# predictions/services/simulation.py
import numpy as np
from ..model_loader import model_loader

class RiskSimulator:
    """Handle what-if analysis simulations"""
    
    def __init__(self, base_data):
        self.base_data = base_data.copy()
        self.base_result = model_loader.predict(base_data)
    
    def simulate_bmi_change(self, new_bmi):
        """Simulate effect of BMI change"""
        modified = self.base_data.copy()
        modified['BMI'] = new_bmi
        result = model_loader.predict(modified)
        
        return {
            'modified_factor': 'BMI',
            'old_value': self.base_data.get('BMI'),
            'new_value': new_bmi,
            'old_risk': self.base_result['probability'] * 100,
            'new_risk': result['probability'] * 100,
            'risk_change': (result['probability'] - self.base_result['probability']) * 100,
            'improvement': result['probability'] < self.base_result['probability']
        }
    
    def simulate_physical_activity(self, active=True):
        """Simulate effect of physical activity"""
        modified = self.base_data.copy()
        modified['PhysActivity'] = 1 if active else 0
        result = model_loader.predict(modified)
        
        return {
            'modified_factor': 'Physical Activity',
            'old_value': 'Active' if self.base_data.get('PhysActivity') else 'Inactive',
            'new_value': 'Active' if active else 'Inactive',
            'old_risk': self.base_result['probability'] * 100,
            'new_risk': result['probability'] * 100,
            'risk_change': (result['probability'] - self.base_result['probability']) * 100,
            'improvement': result['probability'] < self.base_result['probability']
        }
    
    def simulate_smoking_cessation(self):
        """Simulate effect of quitting smoking"""
        modified = self.base_data.copy()
        modified['Smoker'] = 0
        result = model_loader.predict(modified)
        
        return {
            'modified_factor': 'Smoking',
            'old_value': 'Smoker' if self.base_data.get('Smoker') else 'Non-smoker',
            'new_value': 'Non-smoker',
            'old_risk': self.base_result['probability'] * 100,
            'new_risk': result['probability'] * 100,
            'risk_change': (result['probability'] - self.base_result['probability']) * 100,
            'improvement': result['probability'] < self.base_result['probability']
        }
    
    def simulate_diet_improvement(self):
        """Simulate effect of improving diet (more fruits/veggies)"""
        modified = self.base_data.copy()
        modified['Fruits'] = 1
        modified['Veggies'] = 1
        result = model_loader.predict(modified)
        
        return {
            'modified_factor': 'Diet',
            'old_value': f"Fruits: {self.base_data.get('Fruits')}, Veggies: {self.base_data.get('Veggies')}",
            'new_value': 'Fruits: 1, Veggies: 1',
            'old_risk': self.base_result['probability'] * 100,
            'new_risk': result['probability'] * 100,
            'risk_change': (result['probability'] - self.base_result['probability']) * 100,
            'improvement': result['probability'] < self.base_result['probability']
        }
    
    def simulate_blood_pressure_control(self):
        """Simulate effect of controlling blood pressure"""
        modified = self.base_data.copy()
        modified['HighBP'] = 0
        result = model_loader.predict(modified)
        
        return {
            'modified_factor': 'Blood Pressure',
            'old_value': 'High' if self.base_data.get('HighBP') else 'Normal',
            'new_value': 'Normal',
            'old_risk': self.base_result['probability'] * 100,
            'new_risk': result['probability'] * 100,
            'risk_change': (result['probability'] - self.base_result['probability']) * 100,
            'improvement': result['probability'] < self.base_result['probability']
        }
    
    def simulate_cholesterol_control(self):
        """Simulate effect of controlling cholesterol"""
        modified = self.base_data.copy()
        modified['HighChol'] = 0
        result = model_loader.predict(modified)
        
        return {
            'modified_factor': 'Cholesterol',
            'old_value': 'High' if self.base_data.get('HighChol') else 'Normal',
            'new_value': 'Normal',
            'old_risk': self.base_result['probability'] * 100,
            'new_risk': result['probability'] * 100,
            'risk_change': (result['probability'] - self.base_result['probability']) * 100,
            'improvement': result['probability'] < self.base_result['probability']
        }
    
    def simulate_weight_loss(self, target_bmi):
        """Simulate effect of weight loss to target BMI"""
        return self.simulate_bmi_change(target_bmi)
    
    def simulate_multiple_changes(self, changes):
        """Simulate multiple changes at once"""
        modified = self.base_data.copy()
        
        for key, value in changes.items():
            if key in modified:
                modified[key] = value
        
        result = model_loader.predict(modified)
        
        return {
            'modified_factors': list(changes.keys()),
            'old_risk': self.base_result['probability'] * 100,
            'new_risk': result['probability'] * 100,
            'risk_change': (result['probability'] - self.base_result['probability']) * 100,
            'improvement': result['probability'] < self.base_result['probability']
        }
    
    def get_all_simulations(self):
        """Run all simulations and return results"""
        simulations = []
        
        # BMI simulations
        current_bmi = self.base_data.get('BMI', 25)
        for target in [22, 25, 27, 30]:
            if abs(target - current_bmi) > 1:
                simulations.append({
                    'name': f'BMI to {target}',
                    'result': self.simulate_bmi_change(target)
                })
        
        # Lifestyle simulations
        if not self.base_data.get('PhysActivity'):
            simulations.append({
                'name': 'Start Physical Activity',
                'result': self.simulate_physical_activity(True)
            })
        
        if self.base_data.get('Smoker'):
            simulations.append({
                'name': 'Quit Smoking',
                'result': self.simulate_smoking_cessation()
            })
        
        if not (self.base_data.get('Fruits') and self.base_data.get('Veggies')):
            simulations.append({
                'name': 'Improve Diet',
                'result': self.simulate_diet_improvement()
            })
        
        if self.base_data.get('HighBP'):
            simulations.append({
                'name': 'Control Blood Pressure',
                'result': self.simulate_blood_pressure_control()
            })
        
        if self.base_data.get('HighChol'):
            simulations.append({
                'name': 'Control Cholesterol',
                'result': self.simulate_cholesterol_control()
            })
        
        return simulations