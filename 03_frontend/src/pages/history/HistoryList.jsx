// src/pages/history/HistoryList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FunnelIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import HistoryTable from './components/HistoryTable';
import TrendChart from './components/TrendChart';
import ExportButtons from './components/ExportButtons';
import predictionsService from '../../services/predictions';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const HistoryList = () => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState([]);
    const [filteredPredictions, setFilteredPredictions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

    useEffect(() => {
        fetchPredictions();
    }, []);

    useEffect(() => {
        filterPredictions();
    }, [predictions, searchTerm, riskFilter, dateRange]);

    const fetchPredictions = async () => {
        try {
            setLoading(true);
            // Use predictionsService instead of direct api.get
            const response = await predictionsService.getMyPredictions();

            // Handle different response formats
            const predictionsList = response.results || response || [];
            setPredictions(predictionsList);
            setFilteredPredictions(predictionsList);
        } catch (error) {
            console.error('Error fetching predictions:', error);
            toast.error(error.message || 'Failed to load predictions');
            showNotification('error', 'Failed to load prediction history');
        } finally {
            setLoading(false);
        }
    };

    const filterPredictions = () => {
        let filtered = [...predictions];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(pred =>
                pred.id?.toString().includes(searchTerm) ||
                new Date(pred.created_at || pred.prediction_date || pred.date).toLocaleDateString().includes(searchTerm)
            );
        }

        // Apply risk level filter
        if (riskFilter !== 'all') {
            filtered = filtered.filter(pred =>
                (pred.risk_level || pred.result)?.toLowerCase() === riskFilter.toLowerCase()
            );
        }

        // Apply date range filter
        if (dateRange !== 'all') {
            const now = new Date();
            const rangeMap = {
                'week': 7,
                'month': 30,
                'quarter': 90,
                'year': 365,
            };
            const daysAgo = rangeMap[dateRange];
            if (daysAgo) {
                const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
                filtered = filtered.filter(pred => {
                    const predDate = new Date(pred.created_at || pred.prediction_date || pred.date);
                    return predDate >= cutoffDate;
                });
            }
        }

        setFilteredPredictions(filtered);
    };

    const getStats = () => {
        const total = predictions.length;
        const avgRisk = predictions.reduce((acc, pred) => acc + (pred.risk_score || (pred.probability * 100) || 0), 0) / total || 0;
        const highRisk = predictions.filter(p => (p.risk_level || p.result)?.toLowerCase() === 'high').length;
        const moderateRisk = predictions.filter(p => (p.risk_level || p.result)?.toLowerCase() === 'moderate').length;
        const lowRisk = predictions.filter(p => (p.risk_level || p.result)?.toLowerCase() === 'low').length;

        return { total, avgRisk, highRisk, moderateRisk, lowRisk };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your predictions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prediction History</h1>
                    <p className="text-gray-600 mt-1">View and analyze your past risk assessments</p>
                </div>
                <div className="flex space-x-3">
                    {filteredPredictions.length > 0 && <ExportButtons predictions={filteredPredictions} />}
                    <button
                        onClick={fetchPredictions}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            {predictions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-sm text-gray-500">Avg Risk</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.avgRisk.toFixed(1)}%</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-sm text-green-600">Low Risk</p>
                        <p className="text-2xl font-bold text-green-700">{stats.lowRisk}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                        <p className="text-sm text-yellow-600">Moderate Risk</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.moderateRisk}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <p className="text-sm text-red-600">High Risk</p>
                        <p className="text-2xl font-bold text-red-700">{stats.highRisk}</p>
                    </div>
                </motion.div>
            )}

            {/* Filters and View Toggle */}
            {predictions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                >
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by date or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                            />
                        </div>

                        {/* Risk Level Filter */}
                        <div className="w-full md:w-48">
                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                            >
                                <option value="all">All Risk Levels</option>
                                <option value="low">Low Risk</option>
                                <option value="moderate">Moderate Risk</option>
                                <option value="high">High Risk</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div className="w-full md:w-48">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
                            >
                                <option value="all">All Time</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="quarter">Last 90 Days</option>
                                <option value="year">Last Year</option>
                            </select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'table'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode('chart')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'chart'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Chart
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {predictions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No predictions yet</h3>
                        <p className="text-gray-600 mb-6">Start your first risk assessment to see results here.</p>
                        <Link
                            to={ROUTES.PREDICTIONS.NEW}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                        >
                            Make Your First Prediction
                        </Link>
                    </div>
                ) : filteredPredictions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <FunnelIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setRiskFilter('all');
                                setDateRange('all');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : viewMode === 'table' ? (
                    <HistoryTable predictions={filteredPredictions} onRefresh={fetchPredictions} />
                ) : (
                    <TrendChart predictions={filteredPredictions} />
                )}
            </motion.div>
        </div>
    );
};

export default HistoryList;