import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    BeakerIcon,
    DocumentArrowDownIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import ForecastChart from './ForecastChart';
import PeerComparison from './PeerComparison';
import CorrelationMatrix from './CorrelationMatrix';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks';
import ErrorBoundary from '../../components/ErrorBoundary';

// Constants
const TABS = [
    { id: 'forecast', name: 'Risk Forecast', icon: ArrowTrendingUpIcon, description: 'Predict your future risk trends' },
    { id: 'peer', name: 'Peer Comparison', icon: UserGroupIcon, description: 'Compare with similar users' },
    { id: 'correlation', name: 'Factor Correlation', icon: ChartBarIcon, description: 'Understand risk factor relationships' },
];

const SUMMARY_CARDS = [
    {
        id: 'total',
        title: 'Total Predictions',
        icon: ChartBarIcon,
        color: 'blue',
        getValue: (data) => data?.total_predictions || 0,
    },
    {
        id: 'avgRisk',
        title: 'Avg Risk Score',
        icon: ArrowTrendingUpIcon,
        color: 'green',
        getValue: (data) => data?.average_risk ? `${data.average_risk.toFixed(1)}%` : '0%',
    },
    {
        id: 'percentile',
        title: 'Peer Percentile',
        icon: UserGroupIcon,
        color: 'purple',
        getValue: (data, peerData) => peerData?.percentile ? `${peerData.percentile.toFixed(0)}th` : '0th',
    },
    {
        id: 'trend',
        title: 'Risk Trend',
        icon: BeakerIcon,
        color: 'orange',
        getValue: (data) => data?.risk_trend?.charAt(0).toUpperCase() + data?.risk_trend?.slice(1) || 'Stable',
    },
];

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const AdvancedAnalytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('forecast');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [peerData, setPeerData] = useState(null);
    const [correlationData, setCorrelationData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [error, setError] = useState(null);

    // Memoized values
    const hasData = useMemo(() => {
        return !!(analyticsData || forecastData || peerData || correlationData);
    }, [analyticsData, forecastData, peerData, correlationData]);

    const fetchAllAnalytics = useCallback(async (showRefresh = false) => {
        if (!user) return;

        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            // Parallel data fetching for better performance
            const [
                forecastResponse,
                peerResponse,
                correlationResponse,
                analyticsResponse
            ] = await Promise.all([
                api.get('/predictions/analytics/forecast/', { params: dateRange }),
                api.get('/predictions/analytics/peer-comparison/'),
                api.get('/predictions/analytics/correlation/'),
                api.get('/predictions/analytics/', { params: dateRange })
            ]);

            setForecastData(forecastResponse.data);
            setPeerData(peerResponse.data);
            setCorrelationData(correlationResponse.data);
            setAnalyticsData(analyticsResponse.data);

            if (showRefresh) {
                toast.success('Analytics data refreshed');
            }
        } catch (error) {
            console.error('Analytics error:', error);
            setError(error.response?.data?.message || 'Failed to load analytics data');
            toast.error(error.response?.data?.message || 'Failed to load analytics data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, dateRange]);

    useEffect(() => {
        fetchAllAnalytics();
    }, [fetchAllAnalytics]);

    const handleRefresh = () => {
        fetchAllAnalytics(true);
    };

    const handleExportReport = async () => {
        try {
            toast.loading('Preparing your report...', { id: 'export' });

            const response = await api.get('/predictions/export/', {
                params: {
                    format: 'pdf',
                    report_type: 'analytics',
                    start_date: dateRange.start,
                    end_date: dateRange.end
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Analytics report downloaded', { id: 'export' });
        } catch (error) {
            toast.error('Failed to download report', { id: 'export' });
            console.error('Export error:', error);
        }
    };

    const handleDateRangeChange = (type, value) => {
        setDateRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    if (!user) {
        return (
            <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Authentication Required</h2>
                <p className="text-gray-600 dark:text-gray-400">Please log in to view your analytics.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Advanced Analytics</h1>
                        <p className="text-gray-600 dark:text-gray-400">Deep insights into your health trends and patterns</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Date Range Selector */}
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                                className="px-2 py-1 text-sm border-0 focus:ring-0 bg-transparent"
                                max={dateRange.end}
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                                className="px-2 py-1 text-sm border-0 focus:ring-0 bg-transparent"
                                min={dateRange.start}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>

                        <button
                            onClick={handleExportReport}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!hasData}
                        >
                            <DocumentArrowDownIcon className="w-5 h-5" />
                            <span>Export Report</span>
                        </button>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {SUMMARY_CARDS.map((card) => {
                        const Icon = card.icon;
                        const value = card.id === 'percentile'
                            ? card.getValue(analyticsData, peerData)
                            : card.getValue(analyticsData);

                        return (
                            <motion.div
                                key={card.id}
                                variants={fadeInUp}
                                className={`bg-gradient-to-br from-${card.color}-50 to-${card.color}-100 dark:from-${card.color}-900/20 dark:to-${card.color}-800/20 rounded-xl p-6 border border-${card.color}-200 dark:border-${card.color}-800`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm text-${card.color}-600 dark:text-${card.color}-400`}>{card.title}</p>
                                        <p className={`text-2xl font-bold text-${card.color}-700 dark:text-${card.color}-300`}>{value}</p>
                                    </div>
                                    <Icon className={`w-8 h-8 text-${card.color}-500 dark:text-${card.color}-400`} />
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Tabs */}
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                        <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Analytics Tabs">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap ${isActive
                                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        title={tab.description}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'forecast' && <ForecastChart data={forecastData} dateRange={dateRange} />}
                        {activeTab === 'peer' && <PeerComparison data={peerData} />}
                        {activeTab === 'correlation' && <CorrelationMatrix data={correlationData} />}
                    </div>
                </motion.div>

                {/* Insights and Recommendations */}
                {analyticsData && (analyticsData.insights?.length > 0 || analyticsData.recommendations?.length > 0) && (
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Key Insights */}
                        {analyticsData.insights?.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🔍</span>
                                    Key Insights
                                </h3>
                                <div className="space-y-4">
                                    {analyticsData.insights.map((insight, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex-shrink-0">
                                                {getInsightIcon(insight.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{insight.title}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                                                {insight.metric && (
                                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2">
                                                        {insight.metric.label}: {insight.metric.value}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {analyticsData.recommendations?.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">💡</span>
                                    Personalized Recommendations
                                </h3>
                                <div className="space-y-4">
                                    {analyticsData.recommendations.map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:shadow-md transition-shadow"
                                        >
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="text-gray-700 dark:text-gray-300">{rec}</p>
                                                {rec.action && (
                                                    <button
                                                        onClick={() => window.location.href = rec.action.link}
                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                                                    >
                                                        {rec.action.label} →
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* No Data State */}
                {!hasData && !loading && !error && (
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                        <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Analytics Data Yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Complete more health assessments to see your analytics.
                        </p>
                        <button
                            onClick={() => window.location.href = '/predictions/new'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Take an Assessment
                        </button>
                    </motion.div>
                )}
            </div>
        </ErrorBoundary>
    );
};

// PropTypes for better documentation
AdvancedAnalytics.propTypes = {
    // Add any props if needed
};

export default AdvancedAnalytics;