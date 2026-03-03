// ==================== App Constants ====================

export const APP_NAME = 'Diabetes Risk Predictor';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered diabetes risk prediction and health tracking application';

// ==================== API Endpoints ====================

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

// ==================== Risk Levels ====================

export const RISK_LEVELS = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
};

export const RISK_LEVEL_LABELS = {
    [RISK_LEVELS.LOW]: 'Low Risk',
    [RISK_LEVELS.MODERATE]: 'Moderate Risk',
    [RISK_LEVELS.HIGH]: 'High Risk',
};

export const RISK_COLORS = {
    [RISK_LEVELS.LOW]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        gradient: 'from-green-500 to-green-600',
        hex: '#10b981',
    },
    [RISK_LEVELS.MODERATE]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        gradient: 'from-yellow-500 to-yellow-600',
        hex: '#f59e0b',
    },
    [RISK_LEVELS.HIGH]: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        gradient: 'from-red-500 to-red-600',
        hex: '#ef4444',
    },
};

// ==================== Prediction Form ====================

export const PREDICTION_FIELDS = [
    { name: 'age', label: 'Age', type: 'number', min: 18, max: 120 },
    {
        name: 'sex', label: 'Sex', type: 'select', options: [
            { value: 1, label: 'Male' },
            { value: 0, label: 'Female' },
        ]
    },
    { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1 },
    { name: 'highBP', label: 'High Blood Pressure', type: 'checkbox' },
    { name: 'highChol', label: 'High Cholesterol', type: 'checkbox' },
    { name: 'stroke', label: 'Stroke', type: 'checkbox' },
    { name: 'heartDisease', label: 'Heart Disease', type: 'checkbox' },
    { name: 'physActivity', label: 'Physical Activity', type: 'checkbox' },
    { name: 'fruits', label: 'Fruits', type: 'checkbox' },
    { name: 'veggies', label: 'Vegetables', type: 'checkbox' },
    { name: 'smoker', label: 'Smoker', type: 'checkbox' },
    { name: 'heavyAlcohol', label: 'Heavy Alcohol', type: 'checkbox' },
    {
        name: 'genHealth', label: 'General Health', type: 'select', options: [
            { value: 1, label: 'Excellent' },
            { value: 2, label: 'Very Good' },
            { value: 3, label: 'Good' },
            { value: 4, label: 'Fair' },
            { value: 5, label: 'Poor' },
        ]
    },
    { name: 'physHealthDays', label: 'Physical Health Days', type: 'number', min: 0, max: 30 },
    { name: 'mentalHealthDays', label: 'Mental Health Days', type: 'number', min: 0, max: 30 },
    { name: 'diffWalk', label: 'Difficulty Walking', type: 'checkbox' },
];

// ==================== Symptom Types ====================

export const SYMPTOM_TYPES = [
    { value: 'fatigue', label: 'Fatigue', emoji: '😴', severity: 'moderate' },
    { value: 'increased_thirst', label: 'Increased Thirst', emoji: '💧', severity: 'moderate' },
    { value: 'frequent_urination', label: 'Frequent Urination', emoji: '🚽', severity: 'moderate' },
    { value: 'blurred_vision', label: 'Blurred Vision', emoji: '👓', severity: 'high' },
    { value: 'headache', label: 'Headache', emoji: '🤕', severity: 'mild' },
    { value: 'dizziness', label: 'Dizziness', emoji: '😵', severity: 'moderate' },
    { value: 'numbness', label: 'Numbness', emoji: '🖐️', severity: 'high' },
    { value: 'slow_healing', label: 'Slow Healing', emoji: '🩹', severity: 'high' },
    { value: 'weight_loss', label: 'Unexplained Weight Loss', emoji: '⚖️', severity: 'high' },
    { value: 'hunger', label: 'Increased Hunger', emoji: '🍽️', severity: 'mild' },
];

// ==================== Medication Frequency ====================

export const MEDICATION_FREQUENCY = [
    { value: 'daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times', label: 'Three times daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as_needed', label: 'As needed' },
];

// ==================== Goal Types ====================

export const GOAL_TYPES = [
    { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️', unit: 'kg' },
    { value: 'weight_gain', label: 'Weight Gain', icon: '⬆️', unit: 'kg' },
    { value: 'exercise', label: 'Exercise', icon: '🏃', unit: 'minutes' },
    { value: 'bmi_reduction', label: 'BMI Reduction', icon: '📊', unit: 'points' },
    { value: 'risk_reduction', label: 'Risk Reduction', icon: '🩺', unit: '%' },
    { value: 'quit_smoking', label: 'Quit Smoking', icon: '🚭', unit: 'days' },
    { value: 'diet', label: 'Diet', icon: '🥗', unit: 'days' },
];

// ==================== Challenge Types ====================

export const CHALLENGE_TYPES = [
    { value: 'steps', label: 'Steps Challenge', icon: '👣' },
    { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
    { value: 'risk_reduction', label: 'Risk Reduction', icon: '📉' },
    { value: 'prediction_streak', label: 'Prediction Streak', icon: '📊' },
    { value: 'goal_completion', label: 'Goal Completion', icon: '🎯' },
    { value: 'medication_adherence', label: 'Medication Adherence', icon: '💊' },
];

// ==================== Family Relationships ====================

export const FAMILY_RELATIONSHIPS = [
    { value: 'parent', label: 'Parent', weight: 0.3 },
    { value: 'child', label: 'Child', weight: 0.25 },
    { value: 'sibling', label: 'Sibling', weight: 0.3 },
    { value: 'grandparent', label: 'Grandparent', weight: 0.15 },
    { value: 'aunt', label: 'Aunt', weight: 0.1 },
    { value: 'uncle', label: 'Uncle', weight: 0.1 },
    { value: 'cousin', label: 'Cousin', weight: 0.05 },
];

// ==================== Medical Conditions ====================

export const MEDICAL_CONDITIONS = [
    { value: 'diabetes_t1', label: 'Type 1 Diabetes', category: 'diabetes', risk: 1.3 },
    { value: 'diabetes_t2', label: 'Type 2 Diabetes', category: 'diabetes', risk: 1.4 },
    { value: 'gestational', label: 'Gestational Diabetes', category: 'diabetes', risk: 1.1 },
    { value: 'heart_disease', label: 'Heart Disease', category: 'cardiovascular', risk: 1.3 },
    { value: 'hypertension', label: 'Hypertension', category: 'cardiovascular', risk: 1.2 },
    { value: 'stroke', label: 'Stroke', category: 'cardiovascular', risk: 1.25 },
    { value: 'obesity', label: 'Obesity', category: 'metabolic', risk: 1.15 },
    { value: 'kidney_disease', label: 'Kidney Disease', category: 'renal', risk: 1.2 },
];

// ==================== Notification Types ====================

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

export const NOTIFICATION_PRIORITY = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
};

// ==================== Theme Modes ====================

export const THEME_MODES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
};

// ==================== Language Options ====================

export const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
    { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
    { code: 'zh', name: '中文', flag: '🇨🇳', direction: 'ltr' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
];

// ==================== Date Formats ====================

export const DATE_FORMATS = {
    SHORT: 'MM/dd/yyyy',
    MEDIUM: 'MMM dd, yyyy',
    LONG: 'MMMM dd, yyyy',
    FULL: 'EEEE, MMMM dd, yyyy',
    TIME: 'HH:mm',
    DATETIME: 'MMM dd, yyyy HH:mm',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// ==================== Pagination ====================

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ==================== Chart Colors ====================

export const CHART_COLORS = [
    '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4',
    '#84cc16', '#d946ef', '#64748b', '#f43f5e', '#0d9488',
];

// ==================== Local Storage Keys ====================

export const STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
    NOTIFICATIONS: 'notifications',
    BOOKMARKS: 'bookmarks',
    SETTINGS: 'settings',
};

// ==================== Route Paths ====================

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',
    PREDICTION: '/prediction',
    PREDICTION_RESULT: '/prediction/result/:id',
    HISTORY: '/history',
    HISTORY_DETAIL: '/history/:id',
    ANALYTICS: '/analytics',
    HEALTH_COACH: '/health-coach',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    NOTIFICATIONS: '/notifications',
    MEDICATIONS: '/medications',
    SYMPTOMS: '/symptoms',
    GOALS: '/goals',
    MILESTONES: '/milestones',
    CHALLENGES: '/challenges',
    FAMILY_HISTORY: '/family-history',
    RESOURCES: '/resources',
    FAQ: '/faq',
};

// ==================== Error Messages ====================

export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    SERVER: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Your session has expired. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check your input and try again.',
    DEFAULT: 'An error occurred. Please try again.',
};

// ==================== Success Messages ====================

export const SUCCESS_MESSAGES = {
    LOGIN: 'Login successful!',
    REGISTER: 'Registration successful! Please check your email.',
    LOGOUT: 'Logout successful!',
    PROFILE_UPDATE: 'Profile updated successfully!',
    PASSWORD_CHANGE: 'Password changed successfully!',
    PREDICTION_CREATE: 'Prediction completed successfully!',
    GOAL_CREATE: 'Goal created successfully!',
    MEDICATION_ADD: 'Medication added successfully!',
    SYMPTOM_LOG: 'Symptom logged successfully!',
};

// ==================== Validation Rules ====================

export const VALIDATION_RULES = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 254,
    NAME_MAX_LENGTH: 100,
    BIO_MAX_LENGTH: 500,
    NOTES_MAX_LENGTH: 1000,
};

// ==================== File Upload ====================

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/csv', 'application/json'];

// ==================== Cache Duration ====================

export const CACHE_DURATION = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};