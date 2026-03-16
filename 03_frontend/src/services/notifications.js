// src/services/notifications.js
import api from './api';

const notificationService = {
    // Get all notifications
    getNotifications: async (params = {}) => {
        try {
            const response = await api.get('/notifications/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get unread count
    getUnreadCount: async () => {
        try {
            const response = await api.get('/notifications/unread/count/');
            return response.data.count;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark notification as read
    markAsRead: async (id) => {
        try {
            const response = await api.post(`/notifications/${id}/read/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Mark all as read
    markAllAsRead: async () => {
        try {
            const response = await api.post('/notifications/read-all/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete notification
    deleteNotification: async (id) => {
        try {
            const response = await api.delete(`/notifications/${id}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete multiple notifications
    deleteMultiple: async (ids) => {
        try {
            const response = await api.post('/notifications/delete-multiple/', { ids });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Clear all notifications
    clearAll: async () => {
        try {
            const response = await api.delete('/notifications/clear-all/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Archive notification
    archiveNotification: async (id) => {
        try {
            const response = await api.post(`/notifications/${id}/archive/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Restore notification from archive
    restoreNotification: async (id) => {
        try {
            const response = await api.post(`/notifications/${id}/restore/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notification preferences
    getPreferences: async () => {
        try {
            const response = await api.get('/notifications/preferences/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update notification preferences
    updatePreferences: async (preferences) => {
        try {
            const response = await api.put('/notifications/preferences/', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Subscribe to push notifications
    subscribePush: async (subscription) => {
        try {
            const response = await api.post('/notifications/push/subscribe/', subscription);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Unsubscribe from push notifications
    unsubscribePush: async () => {
        try {
            const response = await api.post('/notifications/push/unsubscribe/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notification history
    getHistory: async (params = {}) => {
        try {
            const response = await api.get('/notifications/history/', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Schedule notification
    scheduleNotification: async (data) => {
        try {
            const response = await api.post('/notifications/schedule/', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cancel scheduled notification
    cancelScheduled: async (id) => {
        try {
            const response = await api.delete(`/notifications/schedule/${id}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get scheduled notifications
    getScheduled: async () => {
        try {
            const response = await api.get('/notifications/scheduled/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Test notification
    sendTestNotification: async (type = 'email') => {
        try {
            const response = await api.post('/notifications/test/', { type });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notification stats
    getStats: async () => {
        try {
            const response = await api.get('/notifications/stats/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get notification categories
    getCategories: async () => {
        try {
            const response = await api.get('/notifications/categories/');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default notificationService;