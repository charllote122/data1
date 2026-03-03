import api from '../services/api';

export const predictionsAPI = {
    // Get all predictions with optional filters
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('start_date', params.startDate);
        if (params.endDate) queryParams.append('end_date', params.endDate);
        if (params.riskLevel) queryParams.append('risk_level', params.riskLevel);
        if (params.page) queryParams.append('page', params.page);
        if (params.pageSize) queryParams.append('page_size', params.pageSize);

        const url = `/predictions/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Get single prediction by ID
    getById: async (id) => {
        const response = await api.get(`/predictions/${id}/`);
        return response.data;
    },

    // Get detailed prediction with explanations
    getDetail: async (id) => {
        const response = await api.get(`/predictions/${id}/detail/`);
        return response.data;
    },

    // Create new prediction
    create: async (predictionData) => {
        const response = await api.post('/predictions/', predictionData);
        return response.data;
    },

    // Update prediction
    update: async (id, predictionData) => {
        const response = await api.put(`/predictions/${id}/`, predictionData);
        return response.data;
    },

    // Partial update prediction
    partialUpdate: async (id, predictionData) => {
        const response = await api.patch(`/predictions/${id}/`, predictionData);
        return response.data;
    },

    // Delete prediction
    delete: async (id) => {
        const response = await api.delete(`/predictions/${id}/`);
        return response.data;
    },

    // Get prediction statistics
    getStats: async () => {
        const response = await api.get('/predictions/stats/');
        return response.data;
    },

    // Get prediction trends
    getTrends: async () => {
        const response = await api.get('/predictions/trends/');
        return response.data;
    },

    // Get dashboard data
    getDashboard: async () => {
        const response = await api.get('/predictions/dashboard/');
        return response.data;
    },

    // Get explanation for prediction
    getExplanation: async (id) => {
        const response = await api.get(`/predictions/${id}/explain/`);
        return response.data;
    },

    // Submit feedback for prediction
    submitFeedback: async (id, feedback, notes = '') => {
        const response = await api.post(`/predictions/${id}/feedback/`, { feedback, notes });
        return response.data;
    },

    // Run what-if simulation
    runSimulation: async (simulationData) => {
        const response = await api.post('/predictions/simulate/', simulationData);
        return response.data;
    },

    // Export predictions
    export: async (format = 'csv', startDate = null, endDate = null) => {
        const params = new URLSearchParams({ format });
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        const response = await api.get(`/predictions/export/?${params.toString()}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Get prediction report PDF
    getReport: async (id) => {
        const response = await api.get(`/predictions/${id}/report/`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Get mobile dashboard
    getMobileDashboard: async () => {
        const response = await api.get('/predictions/mobile/dashboard/');
        return response.data;
    },

    // Get personalized plan
    getPersonalizedPlan: async (id) => {
        const response = await api.get(`/predictions/${id}/personalized-plan/`);
        return response.data;
    },
};