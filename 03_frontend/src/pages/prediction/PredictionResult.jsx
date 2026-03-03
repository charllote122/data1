// src/pages/prediction/PredictionResult.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    ShareIcon,
    HeartIcon,
    ClockIcon,
    CalendarIcon,
    ChartBarIcon,
    BeakerIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { usePredictions } from '../../hooks/usePredictions';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';
import { ROUTES } from '../../constants/routes';

// Helper function to get risk color
const getRiskColor = (level) => {
    const colors = {
        low: 'text-green-600 bg-green-50 border-green-200',
        moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        high: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[level?.toLowerCase()] || 'text-gray-600 bg-gray-50 border-gray-200';
};

// Helper function to get risk emoji
const getRiskEmoji = (level) => {
    const emojis = {
        low: '✅',
        moderate: '⚠️',
        high: '🔴',
    };
    return emojis[level?.toLowerCase()] || '📊';
};

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
};

const PredictionResult = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { getPredictionDetail, loading: apiLoading } = usePredictions();

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('factors');
    const [error, setError] = useState(null);

    // Check if this is a public result (from state)
    const publicResult = location.state?.result;
    const isPublic = location.state?.isPublic || false;
    const remainingAttempts = location.state?.remainingAttempts;
    const formData = location.state?.formData;

    useEffect(() => {
        if (publicResult) {
            // Public result from form submission
            console.log('📥 Public result received:', publicResult);
            setPrediction(publicResult);
            setLoading(false);
        } else if (id) {
            // Authenticated result from database
            fetchPrediction();
        } else {
            setError('No prediction data found');
            setLoading(false);
        }
    }, [id, publicResult]);

    const fetchPrediction = async () => {
        try {
            setLoading(true);
            const data = await getPredictionDetail(id);
            if (data) {
                setPrediction(data);
            } else {
                setError('Prediction not found');
            }
        } catch (err) {
            console.error('Error fetching prediction:', err);
            setError('Failed to load prediction');
            toast.error('Failed to load prediction details');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            // In a real app, you'd generate a PDF here
            const dataStr = JSON.stringify(prediction, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `prediction_${id || 'result'}_${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to download report');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
    };

    const handleNewAssessment = () => {
        navigate(ROUTES.PREDICTIONS.NEW);
    };

    const handleSignUp = () => {
        navigate(ROUTES.REGISTER, {
            state: {
                from: ROUTES.PREDICTIONS.NEW,
                assessmentData: formData,
                message: 'Sign up to save your assessment results!'
            }
        });
    };

    // Extract prediction data (handles both formats)
    const predictionData = prediction?.prediction || prediction || {};
    const riskLevel = predictionData.risk_level || predictionData.result || 'unknown';
    const riskScore = predictionData.risk_score || (predictionData.probability ? predictionData.probability * 100 : 0);
    const probability = predictionData.probability || (riskScore / 100) || 0;
    const createdAt = predictionData.created_at || predictionData.date || new Date().toISOString();
    const modelVersion = predictionData.model_version || predictionData.threshold_used ? 'v1.0' : '1.0';

    // Get top factors
    const topFactors = predictionData.top_factors || [];

    if (loading || apiLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading your results...</p>
                </div>
            </div>
        );
    }

    if (error || !prediction) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheckIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h2>
                    <p className="text-gray-600 mb-6">
                        {error || "We couldn't find the prediction result you're looking for."}
                    </p>
                    <button
                        onClick={handleNewAssessment}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <BeakerIcon className="w-5 h-5" />
                        Take New Assessment
                    </button>
                </div>
            </div>
        );
    }

    // If public result, show simplified view
    if (isPublic) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 mr-2" />
                            <span>Back to Form</span>
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <SparklesIcon className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Your Risk Assessment Result</h1>
                            <p className="text-blue-100">Free Preview - Sign up to save and track your results</p>
                        </div>

                        {/* Public Result Content */}
                        <div className="p-8">
                            {/* Risk Score Display */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative w-48 h-48 mb-4">
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="45"
                                            fill="none"
                                            stroke={riskLevel === 'low' ? '#10b981' : riskLevel === 'moderate' ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 45}`}
                                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (riskScore / 100))}`}
                                            transform="rotate(-90 50 50)"
                                        />
                                        <text
                                            x="50"
                                            y="50"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            className="text-2xl font-bold"
                                            fill="#111827"
                                        >
                                            {riskScore.toFixed(1)}%
                                        </text>
                                    </svg>
                                </div>
                                <Badge variant={riskLevel} size="lg" className="mb-2">
                                    {riskLevel.toUpperCase()} RISK
                                </Badge>
                                <p className="text-gray-600">
                                    Probability: {(probability * 100).toFixed(1)}%
                                </p>
                            </div>

                            {/* Top Factors */}
                            {topFactors.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <ChartBarIcon className="w-5 h-5 text-blue-600" />
                                        Top Contributing Factors
                                    </h3>
                                    <div className="space-y-3">
                                        {topFactors.slice(0, 3).map((factor, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {factor.feature || factor.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {factor.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations Preview */}
                            {predictionData.recommendations?.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <HeartIcon className="w-5 h-5 text-blue-600" />
                                        Recommendations
                                    </h3>
                                    <ul className="space-y-2">
                                        {predictionData.recommendations.slice(0, 2).map((rec, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                                <span className="text-blue-600 font-bold">•</span>
                                                <span>{rec.title || rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Sign Up Prompt */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Save Your Results</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Create a free account to save this assessment, track your progress over time, and get personalized insights.
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleSignUp}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                            >
                                                Sign Up Free
                                            </button>
                                            <button
                                                onClick={handleNewAssessment}
                                                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium border border-gray-300"
                                            >
                                                New Assessment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Remaining Attempts */}
                            {remainingAttempts !== undefined && (
                                <div className="text-center text-sm text-gray-500">
                                    You have {remainingAttempts} free {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining today
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Full authenticated view
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-6"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        <span>Back</span>
                    </button>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleExport}
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

                {/* Main Result Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Your Risk Assessment Result</h1>
                                <p className="text-blue-100">Detailed analysis based on your health profile</p>
                            </div>
                            <Badge variant={riskLevel} size="lg">
                                {getRiskEmoji(riskLevel)} {riskLevel.toUpperCase()} RISK
                            </Badge>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Risk Score Display */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-64 h-64 mb-4">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="10"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={riskLevel === 'low' ? '#10b981' : riskLevel === 'moderate' ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="10"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 45}`}
                                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - (riskScore / 100))}`}
                                        transform="rotate(-90 50 50)"
                                    />
                                    <text
                                        x="50"
                                        y="45"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-3xl font-bold"
                                        fill="#111827"
                                    >
                                        {riskScore.toFixed(1)}%
                                    </text>
                                    <text
                                        x="50"
                                        y="60"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-xs"
                                        fill="#6B7280"
                                    >
                                        risk score
                                    </text>
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 mb-2">
                                    {probability > 0.5 ? 'Elevated Risk Detected' : 'Low Risk Detected'}
                                </p>
                                <p className="text-gray-600">
                                    Probability: {(probability * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex justify-center space-x-6 mb-8 text-sm text-gray-500 border-t border-b border-gray-200 py-4">
                            <span className="flex items-center">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {formatDate(createdAt)}
                            </span>
                            <span className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-2" />
                                Model {modelVersion}
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <nav className="flex space-x-8 overflow-x-auto">
                                {[
                                    { id: 'factors', name: 'Top Factors', icon: ChartBarIcon },
                                    { id: 'recommendations', name: 'Recommendations', icon: HeartIcon },
                                    { id: 'details', name: 'Input Details', icon: BeakerIcon },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors whitespace-nowrap
                                            ${activeTab === tab.id
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[300px]">
                            {activeTab === 'factors' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Top Contributing Factors
                                    </h3>
                                    {topFactors.length > 0 ? (
                                        topFactors.map((factor, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{factor.feature || factor.name}</p>
                                                        <p className="text-sm text-gray-500">Value: {factor.value}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {factor.importance ? factor.importance.toFixed(3) : '—'}
                                                    </p>
                                                    <p className={`text-xs ${(factor.impact === 'positive' || factor.importance > 0) ? 'text-red-600' : 'text-green-600'}`}>
                                                        {(factor.impact === 'positive' || factor.importance > 0) ? 'increases risk' : 'decreases risk'}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No factor data available</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'recommendations' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <HeartIcon className="w-5 h-5 text-blue-600" />
                                        Personalized Recommendations
                                    </h3>
                                    {predictionData.recommendations?.length > 0 ? (
                                        <div className="space-y-3">
                                            {predictionData.recommendations.map((rec, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="p-4 bg-blue-50 rounded-lg"
                                                >
                                                    {typeof rec === 'string' ? (
                                                        <p className="text-gray-700">{rec}</p>
                                                    ) : (
                                                        <>
                                                            <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                                                            <p className="text-sm text-gray-600">{rec.description}</p>
                                                        </>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No recommendations available</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <BeakerIcon className="w-5 h-5 text-blue-600" />
                                        Input Data Summary
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {predictionData.patient_data && Object.entries(predictionData.patient_data).map(([key, value]) => (
                                            <div key={key} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">{key}</p>
                                                <p className="font-medium text-gray-900">{String(value)}</p>
                                            </div>
                                        ))}
                                        {!predictionData.patient_data && formData && Object.entries(formData).map(([key, value]) => (
                                            <div key={key} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">{key}</p>
                                                <p className="font-medium text-gray-900">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* New Assessment Button */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleNewAssessment}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                            >
                                <BeakerIcon className="w-5 h-5" />
                                New Assessment
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PredictionResult;