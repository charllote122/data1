import api from '../services/api';

export const analyticsAPI = {
    // Get advanced analytics dashboard
    getAnalytics: async () => {
        const response = await api.get('/analytics/dashboard/');
        return response.data;
    },

    // Get risk forecast
    getForecast: async (months = 3) => {
        const response = await api.get(`/analytics/forecast/?months=${months}`);
        return response.data;
    },

    // Get peer comparison
    getPeerComparison: async () => {
        const response = await api.get('/analytics/peer-comparison/');
        return response.data;
    },

    // Get correlation matrix
    getCorrelationMatrix: async () => {
        const response = await api.get('/analytics/correlation/');
        return response.data;
    },

    // Get trend analysis
    getTrends: async (period = 'month') => {
        const response = await api.get(`/analytics/trends/?period=${period}`);
        return response.data;
    },

    // Get risk distribution
    getRiskDistribution: async () => {
        const response = await api.get('/analytics/risk-distribution/');
        return response.data;
    },

    // Get factor importance
    getFactorImportance: async () => {
        const response = await api.get('/analytics/factor-importance/');
        return response.data;
    },

    // Get progress report
    getProgressReport: async (format = 'pdf') => {
        const response = await api.get(`/analytics/progress-report/?format=${format}`, {
            responseType: format === 'pdf' ? 'blob' : 'json',
        });
        return response.data;
    },

    // Get health score timeline
    getHealthScoreTimeline: async (days = 30) => {
        const response = await api.get(`/analytics/health-score/?days=${days}`);
        return response.data;
    },

    // Export analytics data
    exportAnalytics: async (format = 'csv') => {
        const response = await api.get(`/analytics/export/?format=${format}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Get insights
    getInsights: async () => {
        const response = await api.get('/analytics/insights/');
        return response.data;
    },
};