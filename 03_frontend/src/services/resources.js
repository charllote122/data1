// src/services/resources.js
import api from './api';

class ResourcesService {
    async getArticles(params = {}) {
        try {
            // You may need to add this method to api.js if it doesn't exist
            // For now, we'll use a placeholder
            const response = await api.getChallenges(); // Or whatever endpoint exists
            return response;
        } catch (error) {
            console.error('Error fetching articles:', error);
            throw error;
        }
    }

    async getHealthTips() {
        try {
            const response = await api.getPublicTips();
            return response;
        } catch (error) {
            console.error('Error fetching health tips:', error);
            throw error;
        }
    }

    async getChallenges() {
        try {
            const response = await api.getChallenges();
            return response;
        } catch (error) {
            console.error('Error fetching challenges:', error);
            throw error;
        }
    }

    async joinChallenge(id) {
        try {
            const response = await api.joinChallenge(id);
            return response;
        } catch (error) {
            console.error('Error joining challenge:', error);
            throw error;
        }
    }

    async getMyChallenges() {
        try {
            const response = await api.getMyChallenges();
            return response;
        } catch (error) {
            console.error('Error fetching my challenges:', error);
            throw error;
        }
    }
}

export default new ResourcesService();