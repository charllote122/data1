import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const RecentActivity = ({ predictions }) => {
    const getRiskBadge = (level) => {
        const badges = {
            low: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            moderate: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            high: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return badges[level] || badges.low;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-soft dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <Link
                    to="/history"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center"
                >
                    View All
                    <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {predictions.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No predictions yet</p>
                    <Link
                        to="/prediction"
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 mt-4"
                    >
                        Make Your First Prediction
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {predictions.map((pred, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors dark:bg-gray-700/50 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`w-2 h-2 rounded-full ${pred.risk_level === 'low' ? 'bg-green-500' :
                                        pred.risk_level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Risk Assessment
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDistanceToNow(new Date(pred.prediction_date), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className={getRiskBadge(pred.risk_level)}>
                                    {pred.risk_level}
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {pred.risk_score?.toFixed(1)}%
                                </span>
                                <Link
                                    to={`/history/${pred.id}`}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    <ArrowRightIcon className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentActivity;