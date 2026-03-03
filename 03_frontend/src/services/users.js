// src/services/users.js
import api from './api';

class UserService {
    async getProfile() {
        try {
            const response = await api.getHealthProfile();
            return response;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    async updateProfile(data) {
        try {
            const response = await api.updateHealthProfile(data);
            return response;
        } catch (error) {
            console.error('Error updating profile:', error);
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

export default new UserService();