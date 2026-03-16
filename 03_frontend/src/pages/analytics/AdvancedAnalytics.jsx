// src/pages/analytics/AdvancedAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    UserGroupIcon,
    BeakerIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    SparklesIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import ForecastChart from './ForecastChart';
import PeerComparison from './PeerComparison';
import CorrelationMatrix from './CorrelationMatrix';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

// Simple tabs for easy navigation
const TABS = [
    { id: 'forecast', name: '📈 Risk Forecast', description: 'See how your risk might change' },
    { id: 'peer', name: '👥 Compare with Others', description: 'See how you compare to similar people' },
    { id: 'correlation', name: '🔗 What Affects Your Risk', description: 'Understand what impacts your risk' },
];

const AdvancedAnalytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('forecast');

    // Simple state for each data type
    const [summary, setSummary] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const [peerData, setPeerData] = useState(null);
    const [correlationData, setCorrelationData] = useState(null);
    const [error, setError] = useState(null);

    // Simple date range (last 3 months)
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [dateRange, setDateRange] = useState({
        start: threeMonthsAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
    });

    // Load all analytics data
    useEffect(() => {
        if (user) {
            loadAnalytics();
        }
    }, [user]);

    const loadAnalytics = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        setError(null);

        try {
            // Load summary data
            const summaryData = await api.getAnalyticsSummary();
            setSummary(summaryData);

            // Load forecast data
            const forecast = await api.get('/predictions/analytics/forecast/', {
                params: dateRange
            });
            setForecastData(forecast.data || forecast);

            // Load peer comparison
            const peer = await api.get('/predictions/analytics/peer-comparison/');
            setPeerData(peer.data || peer);

            // Load correlation data
            const correlation = await api.get('/predictions/analytics/correlation/');
            setCorrelationData(correlation.data || correlation);

        } catch (error) {
            console.error('Error loading analytics:', error);
            setError('Unable to load analytics. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadAnalytics(true);
    };

    // Simple explanation cards for beginners
    const ExplanationCard = ({ title, description, icon: Icon }) => (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                    <h3 className="font-medium text-blue-900">{title}</h3>
                    <p className="text-sm text-blue-700 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );

    // Show login prompt if not authenticated
    if (!user) {
        return (
            <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to see your analytics</h2>
                <p className="text-gray-600 mb-6">Create an account to track your health trends over time</p>
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Simple Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Health Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Understand your health trends and patterns</p>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Updating...' : 'Refresh'}
                </button>
            </div>

            {/* Simple Stats Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border">
                        <p className="text-sm text-gray-500">Total Assessments</p>
                        <p className="text-2xl font-bold text-gray-900">{summary.total_predictions || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                        <p className="text-sm text-gray-500">Average Risk</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {summary.average_risk ? summary.average_risk.toFixed(1) + '%' : '0%'}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                        <p className="text-sm text-gray-500">Your Ranking</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {peerData?.percentile ? peerData.percentile.toFixed(0) + 'th' : 'N/A'}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                        <p className="text-sm text-gray-500">Risk Trend</p>
                        <p className="text-2xl font-bold text-gray-900 capitalize">
                            {summary.risk_trend || 'Stable'}
                        </p>
                    </div>
                </div>
            )}

            {/* Simple Date Range (optional) */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border w-fit">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="text-sm border-0 focus:ring-0"
                />
                <span className="text-gray-400">to</span>
                <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="text-sm border-0 focus:ring-0"
                />
            </div>

            {/* Simple Tab Navigation */}
            <div className="border-b">
                <div className="flex gap-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-2 px-1 text-sm font-medium ${activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content with Simple Explanations */}
            <div className="bg-white rounded-xl border p-6">
                {/* Forecast Tab */}
                {activeTab === 'forecast' && (
                    <div>
                        <ExplanationCard
                            icon={ArrowTrendingUpIcon}
                            title="What is Risk Forecast?"
                            description="This chart shows how your diabetes risk might change over time based on your health trends. It helps you plan ahead and make healthier choices."
                        />
                        <ForecastChart data={forecastData} />
                        {(!forecastData || !forecastData.forecast?.length) && (
                            <p className="text-center text-gray-500 py-8">
                                Not enough data yet. Complete more assessments to see your forecast.
                            </p>
                        )}
                    </div>
                )}

                {/* Peer Comparison Tab */}
                {activeTab === 'peer' && (
                    <div>
                        <ExplanationCard
                            icon={UserGroupIcon}
                            title="What is Peer Comparison?"
                            description="See how your health metrics compare to other people like you (same age group and gender). This helps you understand where you stand."
                        />
                        <PeerComparison data={peerData} />
                        {(!peerData || !peerData.peers?.length) && (
                            <p className="text-center text-gray-500 py-8">
                                Not enough data for comparison yet.
                            </p>
                        )}
                    </div>
                )}

                {/* Correlation Tab */}
                {activeTab === 'correlation' && (
                    <div>
                        <ExplanationCard
                            icon={ChartBarIcon}
                            title="What Affects Your Risk?"
                            description="This chart shows which health factors have the biggest impact on your diabetes risk. Darker colors mean stronger influence."
                        />
                        <CorrelationMatrix data={correlationData} />
                        {(!correlationData || !correlationData.factors?.length) && (
                            <p className="text-center text-gray-500 py-8">
                                Complete more assessments to see what affects your risk.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Simple Insights (if available) */}
            {summary?.insights?.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        Key Insights for You
                    </h3>
                    <ul className="space-y-2">
                        {summary.insights.map((insight, i) => (
                            <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                                <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{insight.description || insight}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AdvancedAnalytics;