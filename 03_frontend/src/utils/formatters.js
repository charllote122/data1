import { format, formatDistance, formatRelative, parseISO } from 'date-fns';
import { DATE_FORMATS } from './constants';

// ==================== Date Formatters ====================

/**
 * Format date to short format (MM/DD/YYYY)
 */
export const formatShortDate = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, DATE_FORMATS.SHORT);
    } catch {
        return '';
    }
};

/**
 * Format date to medium format (MMM DD, YYYY)
 */
export const formatMediumDate = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, DATE_FORMATS.MEDIUM);
    } catch {
        return '';
    }
};

/**
 * Format date to long format (MMMM DD, YYYY)
 */
export const formatLongDate = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, DATE_FORMATS.LONG);
    } catch {
        return '';
    }
};

/**
 * Format date to full format (EEEE, MMMM DD, YYYY)
 */
export const formatFullDate = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, DATE_FORMATS.FULL);
    } catch {
        return '';
    }
};

/**
 * Format time (HH:MM)
 */
export const formatTime = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, DATE_FORMATS.TIME);
    } catch {
        return '';
    }
};

/**
 * Format datetime (MMM DD, YYYY HH:MM)
 */
export const formatDateTime = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, DATE_FORMATS.DATETIME);
    } catch {
        return '';
    }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistance(dateObj, new Date(), { addSuffix: true });
    } catch {
        return '';
    }
};

/**
 * Format relative date (e.g., "today at 2:30 PM")
 */
export const formatRelativeDateTime = (date) => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatRelative(dateObj, new Date());
    } catch {
        return '';
    }
};

// ==================== Number Formatters ====================

/**
 * Format number with commas
 */
export const formatNumberWithCommas = (num, decimals = 0) => {
    if (num === null || num === undefined) return '';
    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 1) => {
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
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format decimal with specified precision
 */
export const formatDecimal = (num, decimals = 2) => {
    if (num === null || num === undefined) return '';
    return Number(num).toFixed(decimals);
};

// ==================== String Formatters ====================

/**
 * Format phone number (XXX) XXX-XXXX
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
};

/**
 * Format credit card number
 */
export const formatCreditCard = (cardNumber) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\D/g, '');
    const match = cleaned.match(/(\d{4})?(\d{4})?(\d{4})?(\d{4})?/);
    if (match) {
        return [match[1], match[2], match[3], match[4]].filter(Boolean).join(' ');
    }
    return cardNumber;
};

/**
 * Format SSN (XXX-XX-XXXX)
 */
export const formatSSN = (ssn) => {
    if (!ssn) return '';
    const cleaned = ssn.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return ssn;
};

/**
 * Format name (Last, First)
 */
export const formatName = (firstName, lastName) => {
    if (!firstName && !lastName) return '';
    if (!lastName) return firstName;
    if (!firstName) return lastName;
    return `${lastName}, ${firstName}`;
};

/**
 * Format address
 */
export const formatAddress = (address) => {
    const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country,
    ].filter(Boolean);
    return parts.join(', ');
};

// ==================== Risk Formatters ====================

/**
 * Format risk level with emoji
 */
export const formatRiskLevel = (level) => {
    const icons = {
        low: '🟢 Low',
        moderate: '🟡 Moderate',
        high: '🔴 High',
    };
    return icons[level] || level;
};

/**
 * Format risk score with color
 */
export const formatRiskScore = (score) => {
    const num = Number(score);
    if (num < 30) return { text: `${num}% (Low)`, color: 'green' };
    if (num < 60) return { text: `${num}% (Moderate)`, color: 'yellow' };
    return { text: `${num}% (High)`, color: 'red' };
};

// ==================== Duration Formatters ====================

/**
 * Format seconds to readable duration
 */
export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
};

/**
 * Format minutes to readable duration
 */
export const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

// ==================== List Formatters ====================

/**
 * Format list with Oxford comma
 */
export const formatList = (items, conjunction = 'and') => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
};

/**
 * Format array as bullet points
 */
export const formatBulletPoints = (items) => {
    return items.map(item => `• ${item}`).join('\n');
};

// ==================== Statistics Formatters ====================

/**
 * Format average
 */
export const formatAverage = (numbers, decimals = 1) => {
    if (!numbers || numbers.length === 0) return '0';
    const sum = numbers.reduce((acc, num) => acc + Number(num), 0);
    return (sum / numbers.length).toFixed(decimals);
};

/**
 * Format median
 */
export const formatMedian = (numbers, decimals = 1) => {
    if (!numbers || numbers.length === 0) return '0';
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(decimals);
    }
    return sorted[mid].toFixed(decimals);
};

/**
 * Format percentage change
 */
export const formatChange = (oldValue, newValue, decimals = 1) => {
    if (oldValue === 0) return '+100%';
    const change = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(decimals)}%`;
};

// ==================== JSON Formatters ====================

/**
 * Pretty print JSON
 */
export const formatJSON = (obj, indent = 2) => {
    try {
        return JSON.stringify(obj, null, indent);
    } catch {
        return String(obj);
    }
};

/**
 * Format error message from API response
 */
export const formatApiError = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

// ==================== Template Formatters ====================

/**
 * Format string template with variables
 */
export const formatTemplate = (template, variables) => {
    return template.replace(/\${(\w+)}/g, (match, key) => {
        return variables[key] || match;
    });
};

/**
 * Format count with pluralization
 */
export const formatCount = (count, singular, plural = null) => {
    const word = count === 1 ? singular : (plural || `${singular}s`);
    return `${count} ${word}`;
};