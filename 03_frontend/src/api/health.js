// src/api/health.js
import api from '../services/api';

export const healthAPI = {
    // Health Profile
    getHealthProfile: async () => {
        try {
            // Using fetch-based api service - note: api.get returns response, not response.data
            const response = await api.get('/health/profile/');
            return response; // api.get already returns parsed data via handleResponse
        } catch (error) {
            console.error('Error fetching health profile:', error);
            throw error;
        }
    },

    updateHealthProfile: async (profileData) => {
        try {
            const response = await api.put('/health/profile/', profileData);
            return response;
        } catch (error) {
            console.error('Error updating health profile:', error);
            throw error;
        }
    },

    // Health Goals
    getGoals: async () => {
        try {
            const response = await api.get('/health/goals/');
            return response;
        } catch (error) {
            console.error('Error fetching goals:', error);
            throw error;
        }
    },

    getGoal: async (id) => {
        try {
            const response = await api.get(`/health/goals/${id}/`);
            return response;
        } catch (error) {
            console.error(`Error fetching goal ${id}:`, error);
            throw error;
        }
    },

    createGoal: async (goalData) => {
        try {
            const response = await api.post('/health/goals/', goalData);
            return response;
        } catch (error) {
            console.error('Error creating goal:', error);
            throw error;
        }
    },

    updateGoal: async (id, goalData) => {
        try {
            const response = await api.put(`/health/goals/${id}/`, goalData);
            return response;
        } catch (error) {
            console.error(`Error updating goal ${id}:`, error);
            throw error;
        }
    },

    deleteGoal: async (id) => {
        try {
            const response = await api.delete(`/health/goals/${id}/`);
            return response;
        } catch (error) {
            console.error(`Error deleting goal ${id}:`, error);
            throw error;
        }
    },

    updateGoalProgress: async (id, currentValue) => {
        try {
            const response = await api.patch(`/health/goals/${id}/`, { current_value: currentValue });
            return response;
        } catch (error) {
            console.error(`Error updating goal progress ${id}:`, error);
            throw error;
        }
    },

    // Family History
    getFamilyHistory: async () => {
        try {
            const response = await api.get('/health/family-history/');
            return response;
        } catch (error) {
            console.error('Error fetching family history:', error);
            throw error;
        }
    },

    addFamilyHistory: async (historyData) => {
        try {
            const response = await api.post('/health/family-history/', historyData);
            return response;
        } catch (error) {
            console.error('Error adding family history:', error);
            throw error;
        }
    },

    updateFamilyHistory: async (id, historyData) => {
        try {
            const response = await api.put(`/health/family-history/${id}/`, historyData);
            return response;
        } catch (error) {
            console.error(`Error updating family history ${id}:`, error);
            throw error;
        }
    },

    deleteFamilyHistory: async (id) => {
        try {
            const response = await api.delete(`/health/family-history/${id}/`);
            return response;
        } catch (error) {
            console.error(`Error deleting family history ${id}:`, error);
            throw error;
        }
    },

    // Health Tips
    getHealthTips: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.riskLevel) queryParams.append('risk_level', params.riskLevel);
            if (params.category) queryParams.append('category', params.category);
            if (params.limit) queryParams.append('limit', params.limit);

            const queryString = queryParams.toString();
            const url = `/health/tips/${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching health tips:', error);
            throw error;
        }
    },

    getTipById: async (id) => {
        try {
            const response = await api.get(`/health/tips/${id}/`);
            return response;
        } catch (error) {
            console.error(`Error fetching tip ${id}:`, error);
            throw error;
        }
    },

    submitTipFeedback: async (tipId, helpful) => {
        try {
            const response = await api.post(`/health/tips/${tipId}/feedback/`, { helpful });
            return response;
        } catch (error) {
            console.error(`Error submitting feedback for tip ${tipId}:`, error);
            throw error;
        }
    },

    // Milestones
    getMilestones: async () => {
        try {
            const response = await api.get('/health/milestones/');
            return response;
        } catch (error) {
            console.error('Error fetching milestones:', error);
            throw error;
        }
    },

    getUserMilestones: async () => {
        try {
            const response = await api.get('/health/user-milestones/');
            return response;
        } catch (error) {
            console.error('Error fetching user milestones:', error);
            throw error;
        }
    },

    getMilestoneStats: async () => {
        try {
            const response = await api.get('/health/milestone-stats/');
            return response;
        } catch (error) {
            console.error('Error fetching milestone stats:', error);
            throw error;
        }
    },
};

// Also export a default object for convenience
export default healthAPI;