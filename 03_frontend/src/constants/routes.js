// src/constants/routes.js
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    HISTORY: '/history',
    ANALYTICS: '/analytics',
    GOALS: '/goals',
    CHALLENGES: '/challenges',
    RESOURCES: '/resources',

    PREDICTIONS: {
        NEW: '/prediction',              // Changed from '/predict/new'
        RESULT: '/prediction/result',     // Changed from '/predict/result'
        DETAIL: '/prediction/:id',        // Changed from '/predictions/:id'
    },

    MEDICATIONS: {
        LIST: '/medications',
        CALENDAR: '/medications/calendar',
        NEW: '/medications/new',
        EDIT: '/medications/:id/edit',
    },

    SYMPTOMS: {
        LIST: '/symptoms',
        NEW: '/symptoms/new',
        TRENDS: '/symptoms/trends',
    },

    HEALTH_COACH: {
        HOME: '/health-coach',
        CHAT: '/health-coach/chat',
        DIET: '/health-coach/diet',
        MEDICATIONS: '/health-coach/medications',
        SYMPTOMS: '/health-coach/symptoms',
    },
};