 
import React from 'react';

const ProgressBar = ({ value, max = 100, label, showValue = true, color = 'primary', size = 'md' }) => {
    const percentage = Math.min((value / max) * 100, 100);

    const colors = {
        primary: 'bg-primary-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
        info: 'bg-blue-600',
    };

    const sizes = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
    };

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1">
                    {label && <span className="text-sm text-gray-600">{label}</span>}
                    {showValue && (
                        <span className="text-sm font-medium text-gray-700">
                            {value}/{max} ({Math.round(percentage)}%)
                        </span>
                    )}
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;