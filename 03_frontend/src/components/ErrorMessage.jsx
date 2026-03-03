import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ErrorMessage = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Try again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorMessage;