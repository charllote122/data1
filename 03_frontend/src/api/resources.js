import api from '../services/api';

export const resourcesAPI = {
    // Health Tips
    getHealthTips: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.riskLevel) queryParams.append('risk_level', params.riskLevel);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);

        const url = `/resources/tips/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    getTipById: async (id) => {
        const response = await api.get(`/resources/tips/${id}/`);
        return response.data;
    },

    // Articles
    getArticles: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);

        const url = `/resources/articles/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    getArticleById: async (id) => {
        const response = await api.get(`/resources/articles/${id}/`);
        return response.data;
    },

    // FAQs
    getFAQs: async (category = null) => {
        const url = category ? `/resources/faqs/?category=${category}` : '/resources/faqs/';
        const response = await api.get(url);
        return response.data;
    },

    // Resources
    getResources: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append('type', params.type);
        if (params.search) queryParams.append('search', params.search);

        const url = `/resources/links/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    // Search all resources
    search: async (query) => {
        const response = await api.get(`/resources/search/?q=${query}`);
        return response.data;
    },

    // Get featured content
    getFeatured: async () => {
        const response = await api.get('/resources/featured/');
        return response.data;
    },

    // Get categories
    getCategories: async () => {
        const response = await api.get('/resources/categories/');
        return response.data;
    },

    // Track resource view
    trackView: async (resourceType, resourceId) => {
        const response = await api.post(`/resources/${resourceType}/${resourceId}/view/`);
        return response.data;
    },

    // Like resource
    likeResource: async (resourceType, resourceId) => {
        const response = await api.post(`/resources/${resourceType}/${resourceId}/like/`);
        return response.data;
    },

    // Save resource
    saveResource: async (resourceType, resourceId) => {
        const response = await api.post(`/resources/${resourceType}/${resourceId}/save/`);
        return response.data;
    },

    // Get saved resources
    getSavedResources: async () => {
        const response = await api.get('/resources/saved/');
        return response.data;
    },
};