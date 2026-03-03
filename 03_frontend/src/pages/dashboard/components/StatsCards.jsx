import React from 'react';
import { motion } from 'framer-motion';
import {
    BeakerIcon,
    HeartIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

const StatsCards = ({ stats }) => {
    const cards = [
        {
            title: 'Total Predictions',
            value: stats.totalPredictions,
            icon: BeakerIcon,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
        },
        {
            title: 'Current Risk',
            value: stats.currentRisk ? `${stats.currentRisk.toFixed(1)}%` : 'N/A',
            icon: HeartIcon,
            color: 'bg-red-500',
            bgColor: 'bg-red-50',
            textColor: 'text-red-700',
        },
        {
            title: 'Risk Trend',
            value: stats.riskTrend === 'improving' ? 'Improving' :
                stats.riskTrend === 'worsening' ? 'Worsening' : 'Stable',
            icon: stats.riskTrend === 'improving' ? ArrowTrendingDownIcon : ArrowTrendingUpIcon,
            color: stats.riskTrend === 'improving' ? 'bg-green-500' :
                stats.riskTrend === 'worsening' ? 'bg-red-500' : 'bg-yellow-500',
            bgColor: stats.riskTrend === 'improving' ? 'bg-green-50' :
                stats.riskTrend === 'worsening' ? 'bg-red-50' : 'bg-yellow-50',
            textColor: stats.riskTrend === 'improving' ? 'text-green-700' :
                stats.riskTrend === 'worsening' ? 'text-red-700' : 'text-yellow-700',
        },
        {
            title: 'This Month',
            value: stats.predictionsThisMonth,
            icon: ClockIcon,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${card.bgColor} rounded-xl p-6 border border-gray-100`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${card.textColor} opacity-80`}>{card.title}</p>
                            <p className={`text-2xl font-bold ${card.textColor} mt-2`}>{card.value}</p>
                        </div>
                        <div className={`${card.color} p-3 rounded-lg`}>
                            <card.icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default StatsCards;