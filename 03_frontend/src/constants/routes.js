// src/constants/routes.js
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    HISTORY: '/history',
    PREDICTIONS: {
        NEW: '/predictions/new',
        DETAIL: '/predictions/:id',
        RESULT: '/prediction/result',
    },
    PROFILE: '/profile',
    SETTINGS: '/settings',
    FAMILY: {
        LIST: '/family',
        ADD: '/family/add',
        EDIT: '/family/edit/:id',
    },
    GOALS: '/goals',
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
    RESOURCES: '/resources',
    CHALLENGES: '/challenges',
};

// Additional routes used in Dashboard
export const ADDITIONAL_ROUTES = {
    ACTIVITY: '/activity',
    REWARDS: '/rewards',
    COMMUNITY: '/community',
    ABOUT: '/about',
    DEMO: '/demo',
};