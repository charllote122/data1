import api from '../services/api';

export const usersAPI = {
    // Get user profile
    getProfile: async () => {
        const response = await api.get('/users/profile/');
        return response.data;
    },

    // Update user profile
    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile/', profileData);
        return response.data;
    },

    // Get user settings
    getSettings: async () => {
        const response = await api.get('/users/settings/');
        return response.data;
    },

    // Update user settings
    updateSettings: async (settingsData) => {
        const response = await api.put('/users/settings/', settingsData);
        return response.data;
    },

    // Get notifications
    getNotifications: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.read) queryParams.append('read', params.read);
        if (params.page) queryParams.append('page', params.page);

        const url = `/users/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Mark notification as read
    markNotificationRead: async (notificationId) => {
        const response = await api.post(`/users/notifications/${notificationId}/read/`);
        return response.data;
    },

    // Mark all notifications as read
    markAllNotificationsRead: async () => {
        const response = await api.post('/users/notifications/mark-all-read/');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (notificationId) => {
        const response = await api.delete(`/users/notifications/${notificationId}/`);
        return response.data;
    },

    // Get user activity log
    getActivityLog: async () => {
        const response = await api.get('/users/activity/');
        return response.data;
    },

    // Update privacy settings
    updatePrivacy: async (privacyData) => {
        const response = await api.put('/users/privacy/', privacyData);
        return response.data;
    },

    // Get data usage summary
    getDataUsage: async () => {
        const response = await api.get('/users/data-usage/');
        return response.data;
    },

    // Request data export
    requestDataExport: async () => {
        const response = await api.post('/users/request-data-export/');
        return response.data;
    },

    // Download exported data
    downloadData: async (exportId) => {
        const response = await api.get(`/users/download-data/${exportId}/`, {
            responseType: 'blob',
        });
        return response.data;
    },
};