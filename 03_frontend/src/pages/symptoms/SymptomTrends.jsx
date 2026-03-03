// src/pages/symptoms/SymptomTrends.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSymptoms } from '../../hooks'; // Import from hooks barrel
import {
    ChartBarIcon, CalendarIcon, ArrowPathIcon,
    ExclamationTriangleIcon, HeartIcon
} from '@heroicons/react/24/outline';

const SymptomTrends = () => {
    const { trends, loading, error, refresh } = useSymptoms();
    const [timeframe, setTimeframe] = useState('week'); // week, month, year

    useEffect(() => {
        refresh();
    }, []);

    const getSeverityColor = (severity) => {
        if (severity >= 8) return 'text-red-600';
        if (severity >= 5) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getSeverityBg = (severity) => {
        if (severity >= 8) return 'bg-red-100';
        if (severity >= 5) return 'bg-yellow-100';
        return 'bg-green-100';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Symptom Trends</h1>
                        <p className="text-gray-600 mt-1">Analyze your symptom patterns over time</p>
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex gap-2">
                        {['week', 'month', 'year'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimeframe(period)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors
                                    ${timeframe === period
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {!trends ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ChartBarIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No trend data available</h3>
                        <p className="text-gray-500 mb-6">Start logging symptoms to see trends</p>
                        <button
                            onClick={refresh}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                            Refresh
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Symptoms</h3>
                                <p className="text-3xl font-bold text-gray-900">{trends.total_logged || 0}</p>
                                <p className="text-sm text-gray-500 mt-2">Last {timeframe}</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Average Severity</h3>
                                <p className="text-3xl font-bold text-gray-900">
                                    {trends.avg_severity?.toFixed(1) || 0}/10
                                </p>
                                <p className="text-sm text-gray-500 mt-2">Across all symptoms</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-2">Most Common</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {trends.most_common?.type || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {trends.most_common?.count || 0} occurrences
                                </p>
                            </div>
                        </div>

                        {/* Symptoms by Type */}
                        {trends.by_type && trends.by_type.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Symptoms by Type</h2>
                                <div className="space-y-4">
                                    {trends.by_type.map((item) => (
                                        <div key={item.symptom_type} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">
                                                    {item.symptom_type.split('_').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ')}
                                                </span>
                                                <span className={`text-sm font-medium ${getSeverityColor(item.avg_severity)}`}>
                                                    Avg: {item.avg_severity?.toFixed(1)}/10
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getSeverityBg(item.avg_severity)}`}
                                                        style={{ width: `${(item.count / Math.max(...trends.by_type.map(t => t.count))) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600 min-w-[4rem]">
                                                    {item.count} times
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Trend */}
                        {trends.recent_trend && trends.recent_trend.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-soft p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                                <div className="space-y-3">
                                    {trends.recent_trend.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {item.type.split('_').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ')}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                                                ${item.severity >= 8 ? 'bg-red-100 text-red-700' :
                                                    item.severity >= 5 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'}`}>
                                                Severity: {item.severity}/10
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Insights */}
                        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <HeartIcon className="w-5 h-5 text-primary-600" />
                                Insights
                            </h2>
                            <div className="space-y-3">
                                {trends.insights?.map((insight, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-700">{insight}</p>
                                    </div>
                                ))}
                                {!trends.insights?.length && (
                                    <p className="text-sm text-gray-600">
                                        Continue logging symptoms to receive personalized insights about your health patterns.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SymptomTrends;