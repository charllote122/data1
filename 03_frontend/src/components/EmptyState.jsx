 
import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionText, actionLink }) => {
    return (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            {Icon && (
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-10 h-10 text-gray-400" />
                </div>
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 mb-6">{description}</p>
            {actionText && actionLink && (
                <Link to={actionLink} className="btn-primary inline-block">
                    {actionText}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;