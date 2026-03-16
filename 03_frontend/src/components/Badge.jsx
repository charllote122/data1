// src/components/Badge.jsx
import React from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    BeakerIcon,
    HeartIcon,
    ClockIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    icon = null,
    pill = true,
    bordered = true,
    animated = false,
    dot = false,
}) => {
    const variants = {
        // Risk levels - matches landing page
        low: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
            icon: CheckCircleIcon,
            iconColor: 'text-green-500',
            dotColor: 'bg-green-500',
        },
        moderate: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-yellow-500',
            dotColor: 'bg-yellow-500',
        },
        high: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-red-500',
            dotColor: 'bg-red-500',
        },

        // Feature badges - matches landing page features
        primary: {
            bg: 'bg-primary-50',
            text: 'text-primary-700',
            border: 'border-primary-200',
            icon: SparklesIcon,
            iconColor: 'text-primary-500',
            dotColor: 'bg-primary-500',
        },
        prediction: {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            border: 'border-purple-200',
            icon: BeakerIcon,
            iconColor: 'text-purple-500',
            dotColor: 'bg-purple-500',
        },
        health: {
            bg: 'bg-pink-50',
            text: 'text-pink-700',
            border: 'border-pink-200',
            icon: HeartIcon,
            iconColor: 'text-pink-500',
            dotColor: 'bg-pink-500',
        },
        medication: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-indigo-200',
            icon: ClockIcon,
            iconColor: 'text-indigo-500',
            dotColor: 'bg-indigo-500',
        },
        symptom: {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            border: 'border-orange-200',
            icon: InformationCircleIcon,
            iconColor: 'text-orange-500',
            dotColor: 'bg-orange-500',
        },

        // Status badges
        success: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
            icon: CheckCircleIcon,
            iconColor: 'text-green-500',
            dotColor: 'bg-green-500',
        },
        warning: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-yellow-500',
            dotColor: 'bg-yellow-500',
        },
        error: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-red-500',
            dotColor: 'bg-red-500',
        },
        info: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            icon: InformationCircleIcon,
            iconColor: 'text-blue-500',
            dotColor: 'bg-blue-500',
        },

        // Default fallback
        default: {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
            icon: InformationCircleIcon,
            iconColor: 'text-gray-500',
            dotColor: 'bg-gray-500',
        },
    };

    const sizes = {
        sm: {
            container: 'px-2 py-0.5 text-xs',
            icon: 'w-3 h-3',
            dot: 'w-1.5 h-1.5',
        },
        md: {
            container: 'px-3 py-1 text-sm',
            icon: 'w-4 h-4',
            dot: 'w-2 h-2',
        },
        lg: {
            container: 'px-4 py-2 text-base',
            icon: 'w-5 h-5',
            dot: 'w-2.5 h-2.5',
        },
    };

    const currentVariant = variants[variant] || variants.default;
    const currentSize = sizes[size] || sizes.md;

    // ✅ FIXED: Handle icon properly - don't try to use boolean as component
    const IconComponent = currentVariant.icon;

    const getAnimationClass = () => {
        if (!animated) return '';
        switch (variant) {
            case 'high':
            case 'error':
                return 'animate-pulse';
            case 'success':
                return 'animate-bounce';
            default:
                return 'transition-all duration-200 hover:scale-105';
        }
    };

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                ${currentVariant.bg}
                ${currentVariant.text}
                ${bordered ? currentVariant.border : 'border-transparent'}
                ${pill ? 'rounded-full' : 'rounded-lg'}
                ${currentSize.container}
                ${getAnimationClass()}
                ${className}
            `}
        >
            {/* Dot indicator */}
            {dot && (
                <span
                    className={`
                        inline-block rounded-full
                        ${currentVariant.dotColor}
                        ${currentSize.dot}
                    `}
                />
            )}

            {/* Icon - only render if icon is true or a component is provided */}
            {!dot && IconComponent && icon !== false && (
                <IconComponent className={`${currentSize.icon} ${currentVariant.iconColor}`} />
            )}

            {/* Custom icon string (emoji) - only if icon is a string */}
            {icon && typeof icon === 'string' && (
                <span className="text-base">{icon}</span>
            )}

            {/* Content */}
            <span className="font-medium">{children}</span>
        </span>
    );
};

// Pre-configured badges for common use cases
export const RiskBadge = ({ level, size = 'md', showIcon = true }) => {
    const levels = {
        low: 'low',
        moderate: 'moderate',
        high: 'high',
    };

    const labels = {
        low: 'Low Risk',
        moderate: 'Moderate Risk',
        high: 'High Risk',
    };

    return (
        <Badge
            variant={levels[level?.toLowerCase()] || 'default'}
            size={size}
            icon={showIcon}
            pill
        >
            {labels[level?.toLowerCase()] || level || 'Unknown'}
        </Badge>
    );
};

export const FeatureBadge = ({ feature, size = 'sm' }) => {
    const features = {
        prediction: { variant: 'prediction', label: 'AI Prediction', icon: '🔮' },
        symptom: { variant: 'symptom', label: 'Symptom Tracker', icon: '📊' },
        medication: { variant: 'medication', label: 'Medication', icon: '💊' },
        diet: { variant: 'health', label: 'Diet Plan', icon: '🥗' },
        coach: { variant: 'primary', label: 'Health Coach', icon: '🤖' },
        new: { variant: 'success', label: 'New', icon: '✨' },
        beta: { variant: 'info', label: 'Beta', icon: '🧪' },
        premium: { variant: 'primary', label: 'Premium', icon: '⭐' },
    };

    const config = features[feature] || { variant: 'default', label: feature, icon: '📌' };

    return (
        <Badge variant={config.variant} size={size} icon={config.icon}>
            {config.label}
        </Badge>
    );
};

export const StatusBadge = ({ status, size = 'sm' }) => {
    const statuses = {
        active: { variant: 'success', label: 'Active', icon: '✅' },
        inactive: { variant: 'default', label: 'Inactive', icon: '⏸️' },
        pending: { variant: 'warning', label: 'Pending', icon: '⏳' },
        expired: { variant: 'error', label: 'Expired', icon: '⌛' },
        completed: { variant: 'success', label: 'Completed', icon: '✓' },
        cancelled: { variant: 'error', label: 'Cancelled', icon: '✗' },
        verified: { variant: 'success', label: 'Verified', icon: '✓' },
        unverified: { variant: 'warning', label: 'Unverified', icon: '⚠️' },
    };

    const config = statuses[status] || { variant: 'default', label: status, icon: '•' };

    return (
        <Badge variant={config.variant} size={size} icon={config.icon} pill>
            {config.label}
        </Badge>
    );
};

export const MetricBadge = ({ value, unit, trend, size = 'sm' }) => {
    const getTrendIcon = () => {
        if (trend === 'up') return '↑';
        if (trend === 'down') return '↓';
        return '→';
    };

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-600';
    };

    return (
        <Badge variant="default" size={size} bordered={false}>
            <span className="font-semibold">{value}</span>
            {unit && <span className="text-gray-400 ml-0.5">{unit}</span>}
            {trend && (
                <span className={`ml-1 ${getTrendColor()}`}>
                    {getTrendIcon()}
                </span>
            )}
        </Badge>
    );
};

// Count badge for notifications
export const CountBadge = ({ count, max = 99, size = 'sm' }) => {
    const displayCount = count > max ? `${max}+` : count;
    const sizes = {
        sm: 'min-w-[1.25rem] h-5 text-xs',
        md: 'min-w-[1.5rem] h-6 text-sm',
        lg: 'min-w-[2rem] h-8 text-base',
    };

    if (!count || count === 0) return null;

    return (
        <span
            className={`
                inline-flex items-center justify-center
                bg-primary-600 text-white font-medium
                rounded-full px-1.5
                ${sizes[size]}
            `}
        >
            {displayCount}
        </span>
    );
};

// Timeline badge for showing time periods
export const TimelineBadge = ({ period, size = 'sm' }) => {
    const periods = {
        today: { label: 'Today', icon: '🌟' },
        yesterday: { label: 'Yesterday', icon: '📅' },
        week: { label: 'This Week', icon: '📊' },
        month: { label: 'This Month', icon: '📈' },
    };

    const config = periods[period] || { label: period, icon: '📌' };

    return (
        <Badge variant="info" size={size} icon={config.icon}>
            {config.label}
        </Badge>
    );
};

export default Badge;