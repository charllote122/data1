import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    HeartIcon,
    ArrowRightIcon,
    SparklesIcon,
    ChartBarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Badge from '../../../components/Badge';

const PublicResult = ({ result, remainingAttempts, onNewAssessment }) => {
    const getRiskColor = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getRiskIcon = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low': return CheckCircleIcon;
            case 'moderate': return InformationCircleIcon;
            case 'high': return ExclamationTriangleIcon;
            default: return HeartIcon;
        }
    };

    const RiskIcon = getRiskIcon(result.risk_level);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
        >
            {/* Result Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className={`p-8 text-center ${getRiskColor(result.risk_level)}`}>
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-lg">
                        <RiskIcon className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">
                        {result.risk_level?.toUpperCase()} RISK
                    </h2>
                    {result.risk_score && (
                        <p className="text-lg opacity-90">
                            Risk Score: {result.risk_score}%
                        </p>
                    )}
                </div>

                <div className="p-8 space-y-6">
                    {/* Key Factors */}
                    {result.top_factors && result.top_factors.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5 text-primary-600" />
                                Key Contributing Factors
                            </h3>
                            <div className="space-y-3">
                                {result.top_factors.slice(0, 5).map((factor, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">{factor.name}</span>
                                        <span className={`text-sm font-medium ${factor.impact === 'increases' ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            {factor.impact === 'increases' ? '+' : '-'}
                                            {Math.abs(factor.importance).toFixed(3)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-primary-600" />
                                Recommendations
                            </h3>
                            <ul className="space-y-2">
                                {result.recommendations.map((rec, index) => (
                                    <li key={index} className="flex items-start gap-3 text-gray-600">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Remaining Attempts */}
                    {remainingAttempts !== undefined && (
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <ClockIcon className="w-5 h-5 text-primary-600" />
                                <p className="text-primary-700">
                                    You have <span className="font-semibold">{remainingAttempts}</span> free{' '}
                                    {remainingAttempts === 1 ? 'prediction' : 'predictions'} remaining.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={onNewAssessment}
                            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                        >
                            New Assessment
                        </button>
                        <Link
                            to="/register"
                            className="flex-1 bg-white text-primary-600 py-3 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition text-center"
                        >
                            Sign Up to Save Results
                        </Link>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-gray-400 text-center mt-4">
                        This assessment is for informational purposes only and not a medical diagnosis.
                        Please consult with a healthcare provider for medical advice.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default PublicResult;