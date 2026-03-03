 
import React from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Alert = ({ type = 'info', title, message, onClose, dismissible = false }) => {
    const types = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: CheckCircleIcon,
            iconColor: 'text-green-400',
            titleColor: 'text-green-800',
            messageColor: 'text-green-700',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: XCircleIcon,
            iconColor: 'text-red-400',
            titleColor: 'text-red-800',
            messageColor: 'text-red-700',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-yellow-400',
            titleColor: 'text-yellow-800',
            messageColor: 'text-yellow-700',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: InformationCircleIcon,
            iconColor: 'text-blue-400',
            titleColor: 'text-blue-800',
            messageColor: 'text-blue-700',
        },
    };

    const currentType = types[type] || types.info;
    const Icon = currentType.icon;

    return (
        <div className={`rounded-lg border p-4 ${currentType.bg} ${currentType.border}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${currentType.iconColor}`} aria-hidden="true" />
                </div>
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className={`text-sm font-medium ${currentType.titleColor}`}>{title}</h3>
                    )}
                    {message && (
                        <div className={`mt-2 text-sm ${currentType.messageColor}`}>
                            <p>{message}</p>
                        </div>
                    )}
                </div>
                {dismissible && onClose && (
                    <div className="ml-auto pl-3">
                        <button
                            onClick={onClose}
                            className={`inline-flex rounded-md ${currentType.bg} ${currentType.messageColor} hover:${currentType.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500`}
                        >
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Alert;