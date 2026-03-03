// src/services/predictions.js
import api from './api';

class PredictionsService {
    // ========== PUBLIC ENDPOINTS ==========

    async getPublicPrediction(data) {
        try {
            console.log('📤 Sending public prediction request');
            const result = await api.publicPredict(data);
            return result;
        } catch (error) {
            console.error('❌ Public prediction error:', error);

            if (error.status === 429) {
                error.userMessage = 'Too many attempts. Please try again later or create an account.';
            } else if (error.status === 400) {
                error.userMessage = 'Please check your input values.';
            } else if (!error.status) {
                error.userMessage = 'Network error. Please check your connection.';
            }

            throw error;
        }
    }

    async getPublicTips() {
        try {
            return await api.getPublicTips();
        } catch (error) {
            console.error('Error fetching public tips:', error);
            throw error;
        }
    }

    async getPublicDashboard() {
        try {
            return await api.getPublicDashboard();
        } catch (error) {
            console.error('Error fetching public dashboard:', error);
            throw error;
        }
    }

    async getFeatureInfo() {
        try {
            console.log('📤 Fetching feature info');
            const result = await api.getFeatureInfo();
            return result;
        } catch (error) {
            console.error('❌ Error fetching feature info:', error);
            throw error;
        }
    }

    // ========== AUTHENTICATED ENDPOINTS ==========

    async createPrediction(data) {
        try {
            console.log('📤 Creating authenticated prediction');
            const result = await api.predictions(data, 'POST');
            return result;
        } catch (error) {
            console.error('❌ Create prediction error:', error);
            throw error;
        }
    }

    async getPredictions() {
        try {
            return await api.predictions();
        } catch (error) {
            console.error('Error fetching predictions:', error);
            throw error;
        }
    }

    async getMyPredictions(params = {}) {
        try {
            return await api.getMyPredictions(params);
        } catch (error) {
            console.error('Error fetching prediction history:', error);
            throw error;
        }
    }

    async getPrediction(id) {
        try {
            return await api.getPrediction(id);
        } catch (error) {
            console.error(`Error fetching prediction ${id}:`, error);
            throw error;
        }
    }

    async deletePrediction(id) {
        try {
            return await api.deletePrediction(id);
        } catch (error) {
            console.error(`Error deleting prediction ${id}:`, error);
            throw error;
        }
    }

    async getPredictionExplanation(id) {
        try {
            return await api.getPredictionExplanation(id);
        } catch (error) {
            console.error(`Error fetching explanation for ${id}:`, error);
            throw error;
        }
    }

    async submitFeedback(id, feedback) {
        try {
            return await api.submitPredictionFeedback(id, feedback);
        } catch (error) {
            console.error(`Error submitting feedback for ${id}:`, error);
            throw error;
        }
    }

    async getPredictionTrends() {
        try {
            return await api.getPredictionTrends();
        } catch (error) {
            console.error('Error fetching prediction trends:', error);
            throw error;
        }
    }

    async runSimulation(data) {
        try {
            return await api.runSimulation(data);
        } catch (error) {
            console.error('Error running simulation:', error);
            throw error;
        }
    }

    async getDashboard() {
        try {
            return await api.getDashboard();
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            throw error;
        }
    }
}

export default new PredictionsService();