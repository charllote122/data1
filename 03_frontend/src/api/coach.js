import api from '../services/api';

export const coachAPI = {
    // Chat with AI coach
    sendMessage: async (message) => {
        const response = await api.post('/coach/chat/', { message });
        return response.data;
    },

    // Get chat history
    getChatHistory: async () => {
        const response = await api.get('/coach/chat-history/');
        return response.data;
    },

    // Clear chat history
    clearChatHistory: async () => {
        const response = await api.delete('/coach/chat-history/');
        return response.data;
    },

    // Diet Planner
    getMealPlan: async (date = null) => {
        const url = date ? `/coach/meal-plan/?date=${date}` : '/coach/meal-plan/';
        const response = await api.get(url);
        return response.data;
    },

    generateMealPlan: async (preferences) => {
        const response = await api.post('/coach/generate-meal-plan/', preferences);
        return response.data;
    },

    getRecipe: async (id) => {
        const response = await api.get(`/coach/recipes/${id}/`);
        return response.data;
    },

    saveMealPlan: async (mealPlanData) => {
        const response = await api.post('/coach/save-meal-plan/', mealPlanData);
        return response.data;
    },

    // Medication Management
    getMedications: async () => {
        const response = await api.get('/coach/medications/');
        return response.data;
    },

    getMedication: async (id) => {
        const response = await api.get(`/coach/medications/${id}/`);
        return response.data;
    },

    addMedication: async (medicationData) => {
        const response = await api.post('/coach/medications/', medicationData);
        return response.data;
    },

    updateMedication: async (id, medicationData) => {
        const response = await api.put(`/coach/medications/${id}/`, medicationData);
        return response.data;
    },

    deleteMedication: async (id) => {
        const response = await api.delete(`/coach/medications/${id}/`);
        return response.data;
    },

    markMedicationTaken: async (id, time) => {
        const response = await api.post(`/coach/medications/${id}/taken/`, { time });
        return response.data;
    },

    getMedicationReminders: async () => {
        const response = await api.get('/coach/medication-reminders/');
        return response.data;
    },

    // Symptom Checker
    getSymptoms: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append('start_date', params.startDate);
        if (params.endDate) queryParams.append('end_date', params.endDate);
        if (params.type) queryParams.append('type', params.type);

        const url = `/coach/symptoms/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    getSymptom: async (id) => {
        const response = await api.get(`/coach/symptoms/${id}/`);
        return response.data;
    },

    addSymptom: async (symptomData) => {
        const response = await api.post('/coach/symptoms/', symptomData);
        return response.data;
    },

    updateSymptom: async (id, symptomData) => {
        const response = await api.put(`/coach/symptoms/${id}/`, symptomData);
        return response.data;
    },

    deleteSymptom: async (id) => {
        const response = await api.delete(`/coach/symptoms/${id}/`);
        return response.data;
    },

    getSymptomTrends: async (days = 30) => {
        const response = await api.get(`/coach/symptom-trends/?days=${days}`);
        return response.data;
    },

    // Health Recommendations
    getRecommendations: async () => {
        const response = await api.get('/coach/recommendations/');
        return response.data;
    },

    getDailyTip: async () => {
        const response = await api.get('/coach/daily-tip/');
        return response.data;
    },
};