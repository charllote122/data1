import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
    const variants = {
        low: 'bg-green-100 text-green-800 border-green-200',
        moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        high: 'bg-red-100 text-red-800 border-red-200',
        default: 'bg-gray-100 text-gray-800 border-gray-200',
        primary: 'bg-primary-100 text-primary-800 border-primary-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        error: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;