// src/components/Alert.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    BeakerIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

const Alert = ({
    type = 'info',
    title,
    message,
    onClose,
    dismissible = true,
    autoClose = false,
    autoCloseTime = 5000,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose && onClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose(), 300);
            }, autoCloseTime);
            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseTime, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose && onClose(), 300);
    };

    const types = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: CheckCircleIcon,
            iconColor: 'text-green-600',
            titleColor: 'text-green-800',
            messageColor: 'text-green-700',
            accent: 'green'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: XCircleIcon,
            iconColor: 'text-red-600',
            titleColor: 'text-red-800',
            messageColor: 'text-red-700',
            accent: 'red'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-yellow-600',
            titleColor: 'text-yellow-800',
            messageColor: 'text-yellow-700',
            accent: 'yellow'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: InformationCircleIcon,
            iconColor: 'text-blue-600',
            titleColor: 'text-blue-800',
            messageColor: 'text-blue-700',
            accent: 'blue'
        },
        health: {
            bg: 'bg-primary-50',
            border: 'border-primary-200',
            icon: HeartIcon,
            iconColor: 'text-primary-600',
            titleColor: 'text-primary-800',
            messageColor: 'text-primary-700',
            accent: 'primary'
        },
        prediction: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            icon: BeakerIcon,
            iconColor: 'text-purple-600',
            titleColor: 'text-purple-800',
            messageColor: 'text-purple-700',
            accent: 'purple'
        }
    };

    const currentType = types[type] || types.info;
    const Icon = currentType.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-lg border ${currentType.bg} ${currentType.border} p-4 ${className}`}
                    role="alert"
                >
                    <div className="flex items-start">
                        {/* Icon */}
                        <div className="flex-shrink-0 mr-3">
                            <Icon className={`h-5 w-5 ${currentType.iconColor}`} aria-hidden="true" />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            {title && (
                                <h3 className={`text-sm font-medium ${currentType.titleColor}`}>
                                    {title}
                                </h3>
                            )}
                            {message && (
                                <div className={`mt-1 text-sm ${currentType.messageColor}`}>
                                    <p>{message}</p>
                                </div>
                            )}
                        </div>

                        {/* Close button */}
                        {dismissible && onClose && (
                            <div className="ml-4 flex-shrink-0">
                                <button
                                    onClick={handleClose}
                                    className={`inline-flex rounded-md p-1.5 ${currentType.bg} ${currentType.messageColor} hover:${currentType.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${currentType.accent}-500`}
                                    aria-label="Dismiss"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Progress bar for auto-close */}
                    {autoClose && (
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: autoCloseTime / 1000, ease: 'linear' }}
                            className={`absolute bottom-0 left-0 h-0.5 ${currentType.iconColor} bg-opacity-50 rounded-b-lg`}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Toast notification container
export const Toast = ({ alerts, removeAlert }) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 w-96 max-w-full">
            <AnimatePresence>
                {alerts.map((alert) => (
                    <Alert
                        key={alert.id}
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => removeAlert(alert.id)}
                        autoClose={true}
                        autoCloseTime={5000}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Result alert for prediction outcomes
export const ResultAlert = ({ risk, probability, onNewPrediction }) => {
    const getRiskConfig = () => {
        switch (risk?.toLowerCase()) {
            case 'low':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    icon: CheckCircleIcon,
                    iconColor: 'text-green-600',
                    message: 'Your risk level is low. Keep up the healthy habits!'
                };
            case 'moderate':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    icon: ExclamationTriangleIcon,
                    iconColor: 'text-yellow-600',
                    message: 'Your risk level is moderate. Consider lifestyle changes.'
                };
            case 'high':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    icon: ExclamationTriangleIcon,
                    iconColor: 'text-red-600',
                    message: 'Your risk level is high. Please consult with a healthcare provider.'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    icon: InformationCircleIcon,
                    iconColor: 'text-blue-600',
                    message: 'Complete your assessment to see your risk level.'
                };
        }
    };

    const config = getRiskConfig();
    const Icon = config.icon;

    return (
        <div className={`rounded-xl border ${config.bg} ${config.border} p-6`}>
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                    <Icon className={`h-8 w-8 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Your Risk Level: {risk || 'Not Assessed'}
                    </h3>
                    {probability && (
                        <p className="text-sm text-gray-600 mb-2">
                            Probability: {probability}%
                        </p>
                    )}
                    <p className="text-sm text-gray-700 mb-4">{config.message}</p>
                    <button
                        onClick={onNewPrediction}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                    >
                        New Assessment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;