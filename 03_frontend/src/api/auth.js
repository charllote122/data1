// src/api/auth.js
import apiService from '../services/api';

export const authAPI = {
    // Login user
    login: async (username, password) => {
        const response = await apiService.post('/auth/login/', { username, password });
        return response;
    },

    // Register user
    register: async (userData) => {
        const response = await apiService.post('/auth/register/', userData);
        return response;
    },

    // Get user profile
    getProfile: async () => {
        const response = await apiService.get('/auth/profile/');
        return response;
    },

    // Update profile
    updateProfile: async (profileData) => {
        const response = await apiService.patch('/auth/profile/update/', profileData);
        return response;
    },

    // Logout
    logout: async () => {
        const response = await apiService.post('/auth/logout/');
        return response;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await apiService.post('/auth/change-password/', passwordData);
        return response;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await apiService.post('/auth/password-reset/', { email });
        return response;
    },

    // Reset password
    resetPassword: async (token, newPassword) => {
        const response = await apiService.post(`/auth/password-reset/${token}/`, {
            password: newPassword
        });
        return response;
    },

    // Verify email
    verifyEmail: async (token) => {
        const response = await apiService.get(`/auth/verify-email/${token}/`);
        return response;
    },

    // Resend verification
    resendVerification: async () => {
        const response = await apiService.post('/auth/resend-verification/');
        return response;
    },

    // Get dashboard
    getDashboard: async () => {
        const response = await apiService.get('/auth/dashboard/');
        return response;
    },

    // Health check
    healthCheck: async () => {
        const response = await apiService.get('/auth/health/');
        return response;
    }
};