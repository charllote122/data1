// src/pages/history/components/HistoryTable.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    EyeIcon,
    ChartBarIcon,
    CalendarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const HistoryTable = ({ predictions, onRefresh }) => {
    const getRiskColor = (risk) => {
        const level = risk?.toLowerCase() || '';
        switch (level) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'moderate':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Factors</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {predictions.map((prediction, index) => (
                            <motion.tr
                                key={prediction.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 transition"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                                        {formatDate(prediction.created_at || prediction.prediction_date || prediction.date)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(prediction.risk_level || prediction.result)}`}>
                                        {prediction.risk_level || prediction.result || 'Unknown'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm">
                                        <ChartBarIcon className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="font-medium text-gray-900">
                                            {prediction.risk_score?.toFixed(1) ||
                                                (prediction.probability * 100)?.toFixed(1) ||
                                                'N/A'}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600">
                                        {prediction.top_factors && prediction.top_factors.length > 0 ? (
                                            <span>{prediction.top_factors[0].feature || prediction.top_factors[0].name}</span>
                                        ) : (
                                            <span className="text-gray-400">No factors</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <Link
                                        to={`/predictions/${prediction.id}`}
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                        View
                                    </Link>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTable;