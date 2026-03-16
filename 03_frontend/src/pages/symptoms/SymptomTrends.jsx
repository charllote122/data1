// src/pages/symptoms/SymptomTrends.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSymptoms } from '../../hooks';
import {
    ChartBarIcon,
    CalendarIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    SparklesIcon,
    FireIcon,
    ClockIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    MinusIcon,
    InformationCircleIcon,
    DownloadIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SymptomTrends = () => {
    const { trends, loading, error, refresh } = useSymptoms();
    const [timeframe, setTimeframe] = useState('month');
    const [selectedMetric, setSelectedMetric] = useState('severity');
    const [showInsights, setShowInsights] = useState(true);

    useEffect(() => {
        refresh();
    }, []);

    // Format date safely
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getSeverityColor = (severity) => {
        if (severity >= 8) return 'danger';
        if (severity >= 5) return 'warning';
        return 'success';
    };

    const getSeverityText = (severity) => {
        if (severity >= 8) return 'Severe';
        if (severity >= 5) return 'Moderate';
        return 'Mild';
    };

    const getSeverityBg = (severity) => {
        if (severity >= 8) return 'bg-red-100';
        if (severity >= 5) return 'bg-yellow-100';
        return 'bg-green-100';
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return <TrendingUpIcon className="w-4 h-4 text-red-500" />;
        if (trend < 0) return <TrendingDownIcon className="w-4 h-4 text-green-500" />;
        return <MinusIcon className="w-4 h-4 text-gray-400" />;
    };

    const getTrendText = (trend) => {
        if (trend > 0) return `+${trend}% from last period`;
        if (trend < 0) return `${trend}% from last period`;
        return 'No change';
    };

    const exportData = () => {
        try {
            const dataStr = JSON.stringify(trends, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `symptom-trends-${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            toast.success('Trend data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        }
    };

    const shareInsights = () => {
        if (trends?.insights?.length > 0) {
            const insightsText = trends.insights.join('\n• ');
            const shareText = `My Symptom Insights (${timeframe}):\n• ${insightsText}`;

            if (navigator.share) {
                navigator.share({
                    title: 'Symptom Insights',
                    text: shareText,
                }).catch(() => {
                    navigator.clipboard.writeText(shareText);
                    toast.success('Insights copied to clipboard');
                });
            } else {
                navigator.clipboard.writeText(shareText);
                toast.success('Insights copied to clipboard');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Symptom Trends</h1>
                        <p className="text-gray-600 mt-1">Analyze your symptom patterns over time</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={exportData}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Export data"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={shareInsights}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Share insights"
                            disabled={!trends?.insights?.length}
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={refresh}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Timeframe Selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { value: 'week', label: 'Last 7 Days' },
                        { value: 'month', label: 'Last 30 Days' },
                        { value: 'year', label: 'Last 12 Months' },
                        { value: 'all', label: 'All Time' }
                    ].map((period) => (
                        <button
                            key={period.value}
                            onClick={() => setTimeframe(period.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all
                                ${timeframe === period.value
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>

                {/* Metric Selector */}
                <div className="flex gap-2 mb-6">
                    {[
                        { value: 'severity', label: 'Severity' },
                        { value: 'frequency', label: 'Frequency' }
                    ].map((metric) => (
                        <button
                            key={metric.value}
                            onClick={() => setSelectedMetric(metric.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${selectedMetric === metric.value
                                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {metric.label}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                        >
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!trends ? (
                    <Card className="py-16">
                        <div className="text-center max-w-md mx-auto">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChartBarIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trend data available</h3>
                            <p className="text-gray-500 mb-6">Start logging symptoms to see trends and patterns</p>
                            <button
                                onClick={refresh}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                                Refresh
                            </button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
                                <div className="flex items-center justify-between mb-2">
                                    <ChartBarIcon className="w-5 h-5 text-primary-600" />
                                    <span className="text-xs text-primary-600">Total</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{trends.total_logged || 0}</p>
                                <p className="text-sm text-gray-600 mt-1">Symptoms logged</p>
                                <p className="text-xs text-gray-500 mt-2">Last {timeframe}</p>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                                <div className="flex items-center justify-between mb-2">
                                    <SparklesIcon className="w-5 h-5 text-purple-600" />
                                    <span className="text-xs text-purple-600">Avg Severity</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {trends.avg_severity?.toFixed(1) || 0}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Out of 10</p>
                                <div className="mt-2">
                                    <Badge variant={getSeverityColor(trends.avg_severity)} size="sm">
                                        {getSeverityText(trends.avg_severity)}
                                    </Badge>
                                </div>
                            </Card>

                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                                <div className="flex items-center justify-between mb-2">
                                    <FireIcon className="w-5 h-5 text-orange-600" />
                                    <span className="text-xs text-orange-600">Most Common</span>
                                </div>
                                <p className="text-lg font-bold text-gray-900">
                                    {trends.most_common?.type || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {trends.most_common?.count || 0} occurrences
                                </p>
                                {trends.most_common?.percentage && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {trends.most_common.percentage}% of all symptoms
                                    </p>
                                )}
                            </Card>

                            <Card className="bg-gradient-to-br from-green-50 to-green-100">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUpIcon className="w-5 h-5 text-green-600" />
                                    <span className="text-xs text-green-600">Trend</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(trends.trend_percentage)}
                                    <p className="text-lg font-bold text-gray-900">
                                        {Math.abs(trends.trend_percentage || 0)}%
                                    </p>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {trends.trend_percentage > 0 ? 'Increase' : 'Decrease'} in symptoms
                                </p>
                                <p className="text-xs text-gray-500 mt-2">{getTrendText(trends.trend_percentage)}</p>
                            </Card>
                        </div>

                        {/* Symptoms by Type */}
                        {trends.by_type && trends.by_type.length > 0 && (
                            <Card>
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
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={getSeverityColor(item.avg_severity)} size="sm">
                                                        Avg: {item.avg_severity?.toFixed(1)}/10
                                                    </Badge>
                                                    <span className="text-sm text-gray-600">
                                                        {item.count} {item.count === 1 ? 'time' : 'times'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getSeverityBg(item.avg_severity)} transition-all duration-500`}
                                                        style={{
                                                            width: `${(item.count / Math.max(...trends.by_type.map(t => t.count))) * 100}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 min-w-[3rem] text-right">
                                                    {Math.round((item.count / trends.total_logged) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Severity Distribution */}
                        {trends.severity_distribution && (
                            <Card>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <span className="text-2xl text-green-600">😊</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{trends.severity_distribution.mild || 0}</p>
                                        <p className="text-sm text-gray-600">Mild (1-4)</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <span className="text-2xl text-yellow-600">😐</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{trends.severity_distribution.moderate || 0}</p>
                                        <p className="text-sm text-gray-600">Moderate (5-7)</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <span className="text-2xl text-red-600">🚨</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{trends.severity_distribution.severe || 0}</p>
                                        <p className="text-sm text-gray-600">Severe (8-10)</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Recent Activity */}
                        {trends.recent_trend && trends.recent_trend.length > 0 && (
                            <Card>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                                <div className="space-y-3">
                                    {trends.recent_trend.slice(0, 5).map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(item.date)}
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {item.type?.split('_').map(word =>
                                                        word.charAt(0).toUpperCase() + word.slice(1)
                                                    ).join(' ') || 'Unknown'}
                                                </span>
                                            </div>
                                            <Badge variant={getSeverityColor(item.severity)} size="sm">
                                                Severity: {item.severity}/10
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Insights */}
                        {trends.insights && trends.insights.length > 0 && (
                            <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-primary-600" />
                                        AI Insights
                                    </h2>
                                    <button
                                        onClick={shareInsights}
                                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                    >
                                        <ShareIcon className="w-3 h-3" />
                                        Share
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {trends.insights.map((insight, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-3 bg-white/70 rounded-lg backdrop-blur-sm"
                                        >
                                            <InformationCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-700">{insight}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Recommendations */}
                        {trends.recommendations && trends.recommendations.length > 0 && (
                            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <HeartIcon className="w-5 h-5 text-green-600" />
                                    Recommendations
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {trends.recommendations.map((rec, index) => (
                                        <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                                            <span className="text-green-600 font-bold">{index + 1}.</span>
                                            <p className="text-sm text-gray-700">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Empty Insights State */}
                        {(!trends.insights || trends.insights.length === 0) && (
                            <Card className="bg-gray-50">
                                <div className="text-center py-8">
                                    <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
                                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                                        Continue logging symptoms to receive personalized insights about your health patterns and trends.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SymptomTrends;