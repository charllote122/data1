 
import React from 'react';

const Card = ({ children, className = '', hover = false, padding = true }) => {
    return (
        <div
            className={`bg-white rounded-xl shadow-soft border border-gray-100 ${padding ? 'p-6' : ''
                } ${hover ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;