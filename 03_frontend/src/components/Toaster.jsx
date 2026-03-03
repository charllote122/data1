 
import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Toaster = () => {
    return (
        <HotToaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                success: {
                    icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
                    className: 'bg-green-50 text-green-800 border border-green-200',
                },
                error: {
                    icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
                    className: 'bg-red-50 text-red-800 border border-red-200',
                },
                loading: {
                    className: 'bg-blue-50 text-blue-800 border border-blue-200',
                },
                custom: {
                    icon: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
                    className: 'bg-blue-50 text-blue-800 border border-blue-200',
                },
            }}
        />
    );
};

export default Toaster;