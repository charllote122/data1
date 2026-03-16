// src/services/users.js
import api from './api';

class UserService {
    // Profile methods
    async getProfile() {
        try {
            // Use existing health profile endpoint
            const response = await api.getHealthProfile();
            return response;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    async updateProfile(data) {
        try {
            // Use existing health profile update endpoint
            const response = await api.updateHealthProfile(data);
            return response;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    // Password methods
    async changePassword(passwordData) {
        try {
            const response = await api.changePassword(passwordData);
            return response;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    // Dashboard method
    async getDashboard() {
        try {
            const response = await api.getDashboard();
            return response;
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            throw error;
        }
    }

    // These methods need to be implemented in your API or handled differently
    async uploadProfileImage(formData) {
        try {
            // If your backend doesn't support this yet, you might need to:
            // 1. Add this endpoint to your Django backend
            // 2. Or handle differently for now
            console.warn('Upload profile image not implemented yet');
            return { success: false, message: 'Not implemented' };
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async deleteAccount() {
        try {
            // This would need to be implemented in your backend
            console.warn('Delete account not implemented yet');
            return { success: false, message: 'Not implemented' };
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }

    async getActiveSessions() {
        try {
            // This would need to be implemented in your backend
            console.warn('Get active sessions not implemented yet');
            return [];
        } catch (error) {
            console.error('Error fetching sessions:', error);
            throw error;
        }
    }

    async exportData(format = 'json') {
        try {
            // Use existing export data endpoint
            const response = await api.exportData({ format });
            return response;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    }

    async getActivityLog() {
        try {
            // This would need to be implemented in your backend
            console.warn('Get activity log not implemented yet');
            return [];
        } catch (error) {
            console.error('Error fetching activity log:', error);
            throw error;
        }
    }
}

export default new UserService();