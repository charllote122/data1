// src/pages/history/PredictionDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    ShareIcon,
    HeartIcon,
    ClockIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import predictionsService from '../../services/predictions';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const PredictionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchPredictionDetail();
        } else {
            setError('No prediction ID provided');
            setLoading(false);
        }
    }, [id]);

    const fetchPredictionDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use predictionsService instead of direct api.get
            const data = await predictionsService.getPrediction(id);

            setPrediction(data);
        } catch (error) {
            console.error('Error fetching prediction details:', error);
            setError(error.message || 'Failed to load prediction details');
            showNotification('error', 'Failed to load prediction details');
            toast.error('Failed to load prediction details');
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        const levelLower = level?.toLowerCase() || 'unknown';
        const colors = {
            low: 'text-green-600 bg-green-50 border-green-200',
            moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            high: 'text-red-600 bg-red-50 border-red-200',
        };
        return colors[levelLower] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    const getRiskIcon = (level) => {
        const levelLower = level?.toLowerCase() || 'unknown';
        switch (levelLower) {
            case 'low':
                return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
            case 'moderate':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
            case 'high':
                return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const handleExportPDF = async () => {
        try {
            // This would need a proper export endpoint
            // For now, just download the data as JSON
            const dataStr = JSON.stringify(prediction, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `prediction_${id}_${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            showNotification('success', 'Prediction data exported successfully');
            toast.success('Prediction data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            showNotification('error', 'Failed to export data');
            toast.error('Failed to export data');
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showNotification('success', 'Link copied to clipboard');
            toast.success('Link copied to clipboard');
        } catch (error) {
            console.error('Share error:', error);
            showNotification('error', 'Failed to copy link');
            toast.error('Failed to copy link');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading prediction details...</p>
                </div>
            </div>
        );
    }

    if (error || !prediction) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Prediction Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The prediction you are looking for does not exist.'}</p>
                    <Link
                        to={ROUTES.HISTORY}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back to History
                    </Link>
                </div>
            </div>
        );
    }

    // Extract prediction data (handle different response formats)
    const predictionData = prediction.prediction || prediction;
    const riskLevel = predictionData.risk_level || predictionData.result || 'unknown';
    const riskScore = predictionData.risk_score || (predictionData.probability ? predictionData.probability * 100 : 0);
    const createdAt = predictionData.created_at || predictionData.date || predictionData.prediction_date;
    const topFactors = predictionData.top_factors || [];
    const recommendations = predictionData.recommendations || predictionData.detailed_explanation?.recommendations || [];
    const inputData = predictionData.patient_data || predictionData.input_data || {};

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to History</span>
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={handleExportPDF}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            <DocumentArrowDownIcon className="w-4 h-4" />
                            <span>Export</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            <ShareIcon className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                >
                    {/* Header Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <HeartIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Risk Assessment Details</h1>
                                <p className="text-blue-100 mt-1">Prediction #{id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Metadata */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClockIcon className="w-4 h-4" />
                                    {createdAt ? new Date(createdAt).toLocaleTimeString() : 'N/A'}
                                </span>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${getRiskColor(riskLevel)}`}>
                                {getRiskIcon(riskLevel)}
                                {riskLevel.toUpperCase()} RISK
                            </span>
                        </div>

                        {/* Risk Score Card */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Risk Score</p>
                                    <p className="text-5xl font-bold text-gray-900">
                                        {typeof riskScore === 'number' ? riskScore.toFixed(1) : 'N/A'}%
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Probability: {predictionData.probability ? (predictionData.probability * 100).toFixed(1) + '%' : 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Model Confidence</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {predictionData.threshold_used ?
                                            (predictionData.threshold_used * 100).toFixed(0) + '%' :
                                            '95%'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Top Risk Factors */}
                        {topFactors.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                                    Top Contributing Factors
                                </h2>
                                <div className="space-y-3">
                                    {topFactors.slice(0, 5).map((factor, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{factor.feature || factor.name}</p>
                                                    <p className="text-xs text-gray-500">Value: {factor.value}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {factor.importance ? factor.importance.toFixed(3) : '—'}
                                                </p>
                                                <p className={`text-xs ${(factor.impact === 'positive' || factor.importance > 0) ? 'text-red-600' : 'text-green-600'}`}>
                                                    {(factor.impact === 'positive' || factor.importance > 0) ? 'increases' : 'decreases'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Data */}
                        {Object.keys(inputData).length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                                    Input Data Summary
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(inputData).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">{key}</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                                                    value === null ? '—' : String(value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <HeartIcon className="w-5 h-5 text-blue-600" />
                                    Recommendations
                                </h2>
                                <div className="space-y-3">
                                    {recommendations.map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                                        >
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <div>
                                                {typeof rec === 'string' ? (
                                                    <p className="text-gray-700">{rec}</p>
                                                ) : (
                                                    <>
                                                        <p className="font-medium text-gray-900 mb-1">{rec.title}</p>
                                                        <p className="text-sm text-gray-600">{rec.description}</p>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Assessment Button */}
                        <div className="mt-8 text-center">
                            <Link
                                to={ROUTES.PREDICTIONS.NEW}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                <HeartIcon className="w-5 h-5" />
                                Take New Assessment
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PredictionDetail;