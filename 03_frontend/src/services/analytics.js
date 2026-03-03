// src/services/analytics.js
import api from './api';

class AnalyticsService {
    async getSummary() {
        try {
            const response = await api.getAnalyticsSummary();
            return response;
        } catch (error) {
            console.error('Error fetching analytics summary:', error);
            throw error;
        }
    }

    async exportData(params = {}) {
        try {
            const response = await api.exportData(params);
            return response;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }
}

export default new AnalyticsService();