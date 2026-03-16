// src/services/predictions.js
import api from './api';  // ✅ Import the default instance

class PredictionsService {
    async getMyPredictions(params = {}) {
        try {
            const response = await api.getMyPredictions(params);
            return response;
        } catch (error) {
            console.error('Error fetching predictions:', error);
            throw error;
        }
    }

    async getPrediction(id) {
        try {
            const response = await api.getPrediction(id);
            return response;
        } catch (error) {
            console.error('Error fetching prediction:', error);
            throw error;
        }
    }

    async deletePrediction(id) {
        try {
            const response = await api.deletePrediction(id);
            return response;
        } catch (error) {
            console.error('Error deleting prediction:', error);
            throw error;
        }
    }

    async getPredictionExplanation(id) {
        try {
            const response = await api.getPredictionExplanation(id);
            return response;
        } catch (error) {
            console.error('Error fetching prediction explanation:', error);
            throw error;
        }
    }

    async submitPredictionFeedback(id, feedback) {
        try {
            const response = await api.submitPredictionFeedback(id, feedback);
            return response;
        } catch (error) {
            console.error('Error submitting feedback:', error);
            throw error;
        }
    }

    async getPredictionTrends() {
        try {
            const response = await api.getPredictionTrends();
            return response;
        } catch (error) {
            console.error('Error fetching prediction trends:', error);
            throw error;
        }
    }

    async runSimulation(data) {
        try {
            const response = await api.runSimulation(data);
            return response;
        } catch (error) {
            console.error('Error running simulation:', error);
            throw error;
        }
    }

    async getDashboard() {
        try {
            const response = await api.getDashboard();
            return response;
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            throw error;
        }
    }
}

export default new PredictionsService();