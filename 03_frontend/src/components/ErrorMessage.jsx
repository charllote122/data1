// src/components/ErrorMessage.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ShieldExclamationIcon,
    ArrowPathIcon,
    WifiIcon,
    ServerIcon,
    LockClosedIcon,
    BellAlertIcon
} from '@heroicons/react/24/outline';

const ErrorMessage = ({
    message,
    onRetry,
    onDismiss,
    title = 'Error',
    type = 'error',
    size = 'default',
    variant = 'default',
    showIcon = true,
    dismissible = false,
    retryText = 'Try Again',
    details,
    className = '',
}) => {
    // Error types matching landing page color scheme
    const types = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: XCircleIcon,
            iconColor: 'text-red-600',
            titleColor: 'text-red-800',
            messageColor: 'text-red-700',
            button: 'text-red-600 hover:text-red-700 hover:bg-red-100',
            accent: 'red',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-yellow-600',
            titleColor: 'text-yellow-800',
            messageColor: 'text-yellow-700',
            button: 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100',
            accent: 'yellow',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: InformationCircleIcon,
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-800',
            messageColor: 'text-blue-700',
            button: 'text-blue-600 hover:text-blue-700 hover:bg-blue-100',
            accent: 'blue',
        },
        critical: {
            bg: 'bg-red-100',
            border: 'border-red-300',
            icon: ShieldExclamationIcon,
            iconColor: 'text-red-700',
            titleColor: 'text-red-900',
            messageColor: 'text-red-800',
            button: 'text-red-700 hover:text-red-800 hover:bg-red-200',
            accent: 'red',
        },
        network: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            icon: WifiIcon,
            iconColor: 'text-orange-600',
            titleColor: 'text-orange-800',
            messageColor: 'text-orange-700',
            button: 'text-orange-600 hover:text-orange-700 hover:bg-orange-100',
            accent: 'orange',
        },
        server: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            icon: ServerIcon,
            iconColor: 'text-purple-600',
            titleColor: 'text-purple-800',
            messageColor: 'text-purple-700',
            button: 'text-purple-600 hover:text-purple-700 hover:bg-purple-100',
            accent: 'purple',
        },
        auth: {
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            icon: LockClosedIcon,
            iconColor: 'text-indigo-600',
            titleColor: 'text-indigo-800',
            messageColor: 'text-indigo-700',
            button: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100',
            accent: 'indigo',
        },
    };

    // Size variants
    const sizes = {
        sm: {
            container: 'p-3',
            icon: 'w-4 h-4',
            title: 'text-xs',
            message: 'text-xs',
            button: 'text-xs px-3 py-1.5',
        },
        default: {
            container: 'p-4',
            icon: 'w-5 h-5',
            title: 'text-sm',
            message: 'text-sm',
            button: 'text-sm px-4 py-2',
        },
        lg: {
            container: 'p-6',
            icon: 'w-6 h-6',
            title: 'text-base',
            message: 'text-base',
            button: 'text-base px-5 py-2.5',
        },
    };

    // Variant styles
    const variants = {
        default: {
            rounded: 'rounded-lg',
            shadow: 'shadow-sm',
        },
        card: {
            rounded: 'rounded-xl',
            shadow: 'shadow-soft',
        },
        banner: {
            rounded: 'rounded-none',
            shadow: 'shadow-md',
        },
        toast: {
            rounded: 'rounded-lg',
            shadow: 'shadow-lg',
        },
    };

    const currentType = types[type] || types.error;
    const currentSize = sizes[size] || sizes.default;
    const currentVariant = variants[variant] || variants.default;
    const Icon = currentType.icon;

    // Pre-defined error messages for common scenarios
    const commonErrors = {
        network: {
            title: 'Network Error',
            message: 'Unable to connect to the server. Please check your internet connection.',
        },
        server: {
            title: 'Server Error',
            message: 'Something went wrong on our end. Please try again later.',
        },
        auth: {
            title: 'Authentication Error',
            message: 'Your session has expired. Please log in again.',
        },
        notFound: {
            title: 'Not Found',
            message: 'The requested resource could not be found.',
        },
        validation: {
            title: 'Validation Error',
            message: 'Please check your input and try again.',
        },
        rateLimit: {
            title: 'Too Many Requests',
            message: 'You\'ve made too many requests. Please wait a moment and try again.',
        },
        prediction: {
            title: 'Prediction Error',
            message: 'Unable to process your prediction. Please try again.',
        },
        medication: {
            title: 'Medication Error',
            message: 'Failed to save medication data. Please try again.',
        },
        symptom: {
            title: 'Symptom Error',
            message: 'Unable to log symptom. Please try again.',
        },
    };

    // Use common error if type matches a predefined error
    const errorConfig = commonErrors[type] || { title, message };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
                ${currentType.bg}
                ${currentType.border}
                border
                ${currentVariant.rounded}
                ${currentVariant.shadow}
                ${currentSize.container}
                ${className}
            `}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                {showIcon && (
                    <div className="flex-shrink-0">
                        <Icon className={`${currentSize.icon} ${currentType.iconColor}`} />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${currentType.titleColor} ${currentSize.title}`}>
                        {title || errorConfig.title}
                    </h3>

                    <p className={`mt-1 ${currentType.messageColor} ${currentSize.message}`}>
                        {message || errorConfig.message}
                    </p>

                    {/* Details (if provided) */}
                    {details && (
                        <details className="mt-2">
                            <summary className={`text-xs ${currentType.messageColor} opacity-75 cursor-pointer hover:opacity-100`}>
                                Technical Details
                            </summary>
                            <pre className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs font-mono overflow-auto">
                                {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                            </pre>
                        </details>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {onRetry && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onRetry}
                                className={`
                                    inline-flex items-center gap-1.5
                                    ${currentType.button}
                                    rounded-lg font-medium
                                    transition-colors
                                    ${currentSize.button}
                                `}
                            >
                                <ArrowPathIcon className={`${currentSize.icon}`} />
                                {retryText}
                            </motion.button>
                        )}

                        {dismissible && onDismiss && (
                            <button
                                onClick={onDismiss}
                                className={`
                                    px-3 py-1.5
                                    text-gray-500 hover:text-gray-700
                                    text-sm font-medium
                                    rounded-lg hover:bg-gray-100
                                    transition-colors
                                `}
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>

                {/* Close button for dismissible */}
                {dismissible && onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors"
                        aria-label="Dismiss"
                    >
                        <XCircleIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

// Pre-configured error message components

export const NetworkError = ({ onRetry, onDismiss }) => (
    <ErrorMessage
        type="network"
        title="Connection Error"
        message="Unable to connect to the server. Please check your internet connection and try again."
        onRetry={onRetry}
        onDismiss={onDismiss}
        variant="card"
    />
);

export const ServerError = ({ onRetry, onDismiss }) => (
    <ErrorMessage
        type="server"
        title="Server Error"
        message="Our servers are experiencing issues. We're working on fixing it. Please try again later."
        onRetry={onRetry}
        onDismiss={onDismiss}
        variant="card"
    />
);

export const AuthError = ({ onRetry, onDismiss }) => (
    <ErrorMessage
        type="auth"
        title="Session Expired"
        message="Your session has expired. Please log in again to continue."
        onRetry={onRetry}
        retryText="Go to Login"
        onDismiss={onDismiss}
        variant="card"
    />
);

export const RateLimitError = ({ onRetry, onDismiss, waitTime = 60 }) => (
    <ErrorMessage
        type="warning"
        title="Rate Limit Exceeded"
        message={`You've made too many requests. Please wait ${waitTime} seconds before trying again.`}
        onRetry={onRetry}
        onDismiss={onDismiss}
        variant="card"
    />
);

export const ValidationError = ({ errors, onDismiss }) => (
    <ErrorMessage
        type="warning"
        title="Validation Error"
        message="Please correct the following errors:"
        details={errors}
        onDismiss={onDismiss}
        variant="card"
    />
);

export const PredictionError = ({ onRetry, onDismiss }) => (
    <ErrorMessage
        type="error"
        title="Prediction Failed"
        message="Unable to process your risk assessment. Please try again."
        onRetry={onRetry}
        onDismiss={onDismiss}
        variant="card"
    />
);

export const NotFoundError = ({ resource = 'page', onBack }) => (
    <ErrorMessage
        type="info"
        title="Not Found"
        message={`The ${resource} you're looking for doesn't exist or has been moved.`}
        onRetry={onBack}
        retryText="Go Back"
        variant="card"
    />
);

// Toast-style error message (compact)
export const ErrorToast = ({ message, onDismiss }) => (
    <ErrorMessage
        message={message}
        type="error"
        size="sm"
        variant="toast"
        dismissible={true}
        onDismiss={onDismiss}
        className="max-w-md"
    />
);

// Inline error for forms
export const FormError = ({ message }) => (
    <ErrorMessage
        message={message}
        type="warning"
        size="sm"
        variant="default"
        showIcon={true}
        className="mt-2"
    />
);

// Banner error for page-level issues
export const ErrorBanner = ({ message, onRetry }) => (
    <ErrorMessage
        message={message}
        type="critical"
        size="lg"
        variant="banner"
        onRetry={onRetry}
        className="w-full"
    />
);

export default ErrorMessage;