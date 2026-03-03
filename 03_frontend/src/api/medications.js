import api from '../services/api';

export const medicationsAPI = {
    // Get all medications
    getAll: async () => {
        const response = await api.get('/medications/');
        return response.data;
    },

    // Get single medication
    getById: async (id) => {
        const response = await api.get(`/medications/${id}/`);
        return response.data;
    },

    // Create medication
    create: async (medicationData) => {
        const response = await api.post('/medications/', medicationData);
        return response.data;
    },

    // Update medication
    update: async (id, medicationData) => {
        const response = await api.put(`/medications/${id}/`, medicationData);
        return response.data;
    },

    // Delete medication
    delete: async (id) => {
        const response = await api.delete(`/medications/${id}/`);
        return response.data;
    },

    // Mark medication as taken
    markTaken: async (id, time) => {
        const response = await api.post(`/medications/${id}/taken/`, { time });
        return response.data;
    },

    // Get today's medications
    getTodaysMeds: async () => {
        const response = await api.get('/medications/today/');
        return response.data;
    },

    // Get medication statistics
    getStats: async () => {
        const response = await api.get('/medications/stats/');
        return response.data;
    },

    // Get adherence report
    getAdherenceReport: async (days = 30) => {
        const response = await api.get(`/medications/adherence/?days=${days}`);
        return response.data;
    },

    // Get refill reminders
    getRefillReminders: async () => {
        const response = await api.get('/medications/refill-reminders/');
        return response.data;
    },

    // Set refill reminder
    setRefillReminder: async (id, reminderDate) => {
        const response = await api.post(`/medications/${id}/refill-reminder/`, { reminder_date: reminderDate });
        return response.data;
    },

    // Get medication interactions
    checkInteractions: async () => {
        const response = await api.get('/medications/interactions/');
        return response.data;
    },
};