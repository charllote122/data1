import React from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ riskScore = 0, riskLevel = 'low' }) => {
    const getColor = (level) => {
        const colors = {
            low: '#10b981',
            moderate: '#f59e0b',
            high: '#ef4444',
        };
        return colors[level] || '#10b981';
    };

    const getMessage = (level, score) => {
        if (level === 'high') {
            return 'High risk detected. Please consult a healthcare provider.';
        } else if (level === 'moderate') {
            return 'Moderate risk. Consider lifestyle changes.';
        } else {
            return 'Low risk. Keep up the healthy habits!';
        }
    };

    const getBadgeClass = (level) => {
        const badges = {
            low: 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
            moderate: 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
            high: 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        };
        return badges[level] || badges.low;
    };

    const color = getColor(riskLevel);
    const percentage = Math.min(riskScore, 100);

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-soft dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Risk Level</h2>

            <div className="relative pt-4">
                {/* Gauge Background */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                    />
                </div>

                {/* Risk Score Display */}
                <div className="mt-6 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="inline-block"
                    >
                        <span className="text-5xl font-bold" style={{ color }}>
                            {riskScore.toFixed(1)}%
                        </span>
                    </motion.div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{getMessage(riskLevel, riskScore)}</p>
                </div>

                {/* Risk Level Badge */}
                <div className="mt-4 flex justify-center">
                    <span className={getBadgeClass(riskLevel)}>
                        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Low Risk</span>
                <span>Moderate Risk</span>
                <span>High Risk</span>
            </div>
        </div>
    );
};

export default RiskGauge;