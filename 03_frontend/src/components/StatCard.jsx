 
import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend = null }) => {
    const colors = {
        blue: {
            bg: 'bg-blue-50',
            icon: 'bg-blue-500',
            text: 'text-blue-700',
        },
        green: {
            bg: 'bg-green-50',
            icon: 'bg-green-500',
            text: 'text-green-700',
        },
        red: {
            bg: 'bg-red-50',
            icon: 'bg-red-500',
            text: 'text-red-700',
        },
        yellow: {
            bg: 'bg-yellow-50',
            icon: 'bg-yellow-500',
            text: 'text-yellow-700',
        },
        purple: {
            bg: 'bg-purple-50',
            icon: 'bg-purple-500',
            text: 'text-purple-700',
        },
    };

    const currentColor = colors[color] || colors.blue;

    return (
        <div className={`${currentColor.bg} rounded-xl p-6 border border-gray-100`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm ${currentColor.text} opacity-80`}>{title}</p>
                    <p className={`text-2xl font-bold ${currentColor.text} mt-2`}>{value}</p>
                    {trend && (
                        <p className={`text-xs ${currentColor.text} mt-1`}>
                            {trend.value > 0 ? '+' : ''}{trend.value}% from last {trend.period}
                        </p>
                    )}
                </div>
                <div className={`${currentColor.icon} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;