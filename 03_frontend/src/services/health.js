// src/services/health.js
import api from './api';

class HealthService {
    async getProfile() {
        try {
            const response = await api.getHealthProfile();
            return response;
        } catch (error) {
            console.error('Error fetching health profile:', error);
            throw error;
        }
    }

    async updateProfile(data) {
        try {
            const response = await api.updateHealthProfile(data);
            return response;
        } catch (error) {
            console.error('Error updating health profile:', error);
            throw error;
        }
    }

    async updateMetrics(data) {
        try {
            const response = await api.updateHealthMetrics(data);
            return response;
        } catch (error) {
            console.error('Error updating health metrics:', error);
            throw error;
        }
    }

    async getHistory() {
        try {
            const response = await api.getHealthHistory();
            return response;
        } catch (error) {
            console.error('Error fetching health history:', error);
            throw error;
        }
    }
}

export default new HealthService();