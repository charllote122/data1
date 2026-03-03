import api from '../services/api';

export const symptomsAPI = {
    // Get all symptoms
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append('start_date', params.startDate);
        if (params.endDate) queryParams.append('end_date', params.endDate);
        if (params.type) queryParams.append('type', params.type);
        if (params.limit) queryParams.append('limit', params.limit);

        const url = `/symptoms/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Get single symptom
    getById: async (id) => {
        const response = await api.get(`/symptoms/${id}/`);
        return response.data;
    },

    // Create symptom log
    create: async (symptomData) => {
        const response = await api.post('/symptoms/', symptomData);
        return response.data;
    },

    // Update symptom
    update: async (id, symptomData) => {
        const response = await api.put(`/symptoms/${id}/`, symptomData);
        return response.data;
    },

    // Delete symptom
    delete: async (id) => {
        const response = await api.delete(`/symptoms/${id}/`);
        return response.data;
    },

    // Get symptom trends
    getTrends: async (days = 30) => {
        const response = await api.get(`/symptoms/trends/?days=${days}`);
        return response.data;
    },

    // Get symptom statistics
    getStats: async () => {
        const response = await api.get('/symptoms/stats/');
        return response.data;
    },

    // Get common symptoms
    getCommonSymptoms: async (days = 30) => {
        const response = await api.get(`/symptoms/common/?days=${days}`);
        return response.data;
    },

    // Get symptom severity distribution
    getSeverityDistribution: async () => {
        const response = await api.get('/symptoms/severity-distribution/');
        return response.data;
    },

    // Export symptom data
    exportData: async (format = 'csv') => {
        const response = await api.get(`/symptoms/export/?format=${format}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};