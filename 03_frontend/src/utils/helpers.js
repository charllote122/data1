import { format, formatDistance, formatRelative, parseISO, differenceInDays } from 'date-fns';
import { DATE_FORMATS } from './constants';

// ==================== Date Helpers ====================

/**
 * Format a date string or Date object
 */
export const formatDate = (date, formatStr = DATE_FORMATS.MEDIUM) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Get relative time string (e.g., "2 days ago")
 */
export const getRelativeTime = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistance(dateObj, new Date(), { addSuffix: true });
    } catch (error) {
        console.error('Error getting relative time:', error);
        return '';
    }
};

/**
 * Get relative date string (e.g., "yesterday at 2:30 PM")
 */
export const getRelativeDate = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatRelative(dateObj, new Date());
    } catch (error) {
        console.error('Error getting relative date:', error);
        return '';
    }
};

/**
 * Check if a date is today
 */
export const isToday = (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return differenceInDays(new Date(), dateObj) === 0;
};

/**
 * Check if a date is in the past
 */
export const isPast = (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj < new Date();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj > new Date();
};

/**
 * Get days remaining until a date
 */
export const daysRemaining = (date) => {
    if (!date) return 0;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const diff = differenceInDays(dateObj, new Date());
    return Math.max(0, diff);
};

// ==================== Number Helpers ====================

/**
 * Format a number with commas
 */
export const formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined) return '';
    return Number(num).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Format a percentage
 */
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '';
    return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

/**
 * Clamp a number between min and max
 */
export const clamp = (num, min, max) => {
    return Math.min(Math.max(num, min), max);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total, decimals = 1) => {
    if (!total) return 0;
    return Number(((value / total) * 100).toFixed(decimals));
};

// ==================== String Helpers ====================

/**
 * Truncate a string to max length
 */
export const truncateString = (str, maxLength = 100, suffix = '...') => {
    if (!str) return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalize each word
 */
export const capitalizeWords = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Convert string to slug
 */
export const slugify = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

/**
 * Generate random string
 */
export const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// ==================== Array Helpers ====================

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        }
        return a[key] < b[key] ? 1 : -1;
    });
};

/**
 * Unique array by key
 */
export const uniqueBy = (array, key) => {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = (array, size) => {
    return array.reduce((chunks, item, index) => {
        const chunkIndex = Math.floor(index / size);
        if (!chunks[chunkIndex]) {
            chunks[chunkIndex] = [];
        }
        chunks[chunkIndex].push(item);
        return chunks;
    }, []);
};

// ==================== Object Helpers ====================

/**
 * Pick specific keys from object
 */
export const pick = (obj, keys) => {
    return keys.reduce((result, key) => {
        if (obj.hasOwnProperty(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
};

/**
 * Omit specific keys from object
 */
export const omit = (obj, keys) => {
    return Object.keys(obj).reduce((result, key) => {
        if (!keys.includes(key)) {
            result[key] = obj[key];
        }
        return result;
    }, {});
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};

// ==================== Storage Helpers ====================

/**
 * Save to localStorage
 */
export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
};

/**
 * Load from localStorage
 */
export const loadFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
};

/**
 * Remove from localStorage
 */
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
};

/**
 * Clear all localStorage
 */
export const clearStorage = () => {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage:', error);
        return false;
    }
};

// ==================== Color Helpers ====================

/**
 * Get contrasting text color (black or white) based on background
 */
export const getContrastColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Lighten a color
 */
export const lightenColor = (hexColor, percent) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const lighten = (color) => Math.min(255, Math.round(color + (255 - color) * percent));

    const rr = lighten(r).toString(16).padStart(2, '0');
    const gg = lighten(g).toString(16).padStart(2, '0');
    const bb = lighten(b).toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
};

/**
 * Darken a color
 */
export const darkenColor = (hexColor, percent) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const darken = (color) => Math.max(0, Math.round(color * (1 - percent)));

    const rr = darken(r).toString(16).padStart(2, '0');
    const gg = darken(g).toString(16).padStart(2, '0');
    const bb = darken(b).toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
};

// ==================== URL Helpers ====================

/**
 * Get query parameters from URL
 */
export const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
};

/**
 * Build URL with query parameters
 */
export const buildUrl = (base, params) => {
    const url = new URL(base, window.location.origin);
    Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
    });
    return url.toString();
};

/**
 * Get base URL without query parameters
 */
export const getBaseUrl = () => {
    return window.location.origin + window.location.pathname;
};

// ==================== Device Helpers ====================

/**
 * Check if device is mobile
 */
export const isMobile = () => {
    return window.innerWidth <= 768;
};

/**
 * Check if device is tablet
 */
export const isTablet = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
};

/**
 * Check if device is desktop
 */
export const isDesktop = () => {
    return window.innerWidth > 1024;
};

/**
 * Check if touch device
 */
export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// ==================== OS Detection ====================

/**
 * Check if iOS
 */
export const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Check if Android
 */
export const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
};

/**
 * Check if Windows
 */
export const isWindows = () => {
    return /Windows/.test(navigator.userAgent);
};

/**
 * Check if Mac
 */
export const isMac = () => {
    return /Mac/.test(navigator.userAgent);
};

// ==================== Browser Detection ====================

/**
 * Check if Chrome
 */
export const isChrome = () => {
    return /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
};

/**
 * Check if Firefox
 */
export const isFirefox = () => {
    return /Firefox/.test(navigator.userAgent);
};

/**
 * Check if Safari
 */
export const isSafari = () => {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
};

/**
 * Check if Edge
 */
export const isEdge = () => {
    return /Edg/.test(navigator.userAgent);
};

// ==================== Network Helpers ====================

/**
 * Check if online
 */
export const isOnline = () => {
    return navigator.onLine;
};

/**
 * Get connection type
 */
export const getConnectionType = () => {
    if ('connection' in navigator) {
        return navigator.connection.effectiveType;
    }
    return 'unknown';
};

// ==================== Performance Helpers ====================

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
};

/**
 * Measure execution time
 */
export const measureTime = (fn, label = 'Function') => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label} took ${end - start}ms`);
    return result;
};

/**
 * Memoize function results
 */
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};