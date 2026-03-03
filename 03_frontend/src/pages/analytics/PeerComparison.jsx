import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    LabelList
} from 'recharts';
import {
    UserGroupIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    MinusIcon,
    InformationCircleIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    FireIcon,
    HeartIcon,
    BeakerIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const PeerComparison = ({ data }) => {
    const [selectedMetric, setSelectedMetric] = useState(null);
    const [chartView, setChartView] = useState('radar'); // 'radar' or 'bar'

    // Memoized calculations
    const comparisonStats = useMemo(() => {
        if (!data) return null;

        const difference = data.user_risk - data.peer_average;
        const percentDifference = data.peer_average ? (difference / data.peer_average) * 100 : 0;

        return {
            difference,
            percentDifference,
            status: difference < -5 ? 'better' : difference > 5 ? 'worse' : 'similar',
            improvement: data.user_risk < data.peer_average ? data.peer_average - data.user_risk : 0,
            riskGap: Math.abs(difference)
        };
    }, [data]);

    // Radar chart data
    const radarData = useMemo(() => {
        if (!data) return [];

        return [
            {
                subject: 'Risk Score',
                user: data.user_risk || 0,
                peer: data.peer_average || 0,
                fullMark: 100,
                description: 'Overall diabetes risk score'
            },
            {
                subject: 'BMI',
                user: data.user_bmi || 0,
                peer: data.peer_bmi || 0,
                fullMark: 40,
                description: 'Body Mass Index'
            },
            {
                subject: 'Activity',
                user: data.user_activity || 0,
                peer: data.peer_activity || 0,
                fullMark: 100,
                description: 'Physical activity level'
            },
            {
                subject: 'Diet',
                user: data.user_diet || 0,
                peer: data.peer_diet || 0,
                fullMark: 100,
                description: 'Diet quality score'
            },
            {
                subject: 'Sleep',
                user: data.user_sleep || 0,
                peer: data.peer_sleep || 0,
                fullMark: 100,
                description: 'Sleep quality score'
            },
        ];
    }, [data]);

    // Factor comparison data
    const factorData = useMemo(() => {
        if (!data) return [];
        return data.factor_comparison || [];
    }, [data]);

    // Get color based on value comparison
    const getComparisonColor = (userValue, peerValue) => {
        if (!userValue || !peerValue) return 'text-gray-600';
        const diff = userValue - peerValue;
        if (diff < -5) return 'text-green-600';
        if (diff > 5) return 'text-red-600';
        return 'text-yellow-600';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'better':
                return <ArrowDownIcon className="w-4 h-4 text-green-600" />;
            case 'worse':
                return <ArrowUpIcon className="w-4 h-4 text-red-600" />;
            default:
                return <MinusIcon className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getMetricIcon = (metric) => {
        switch (metric?.toLowerCase()) {
            case 'risk score':
                return <ShieldCheckIcon className="w-5 h-5" />;
            case 'bmi':
                return <BeakerIcon className="w-5 h-5" />;
            case 'activity':
                return <FireIcon className="w-5 h-5" />;
            case 'diet':
                return <HeartIcon className="w-5 h-5" />;
            case 'sleep':
                return <ClockIcon className="w-5 h-5" />;
            default:
                return <ChartBarIcon className="w-5 h-5" />;
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="text-sm flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {entry.value?.toFixed(1)}
                                {entry.name === 'BMI' ? '' : '%'}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (!data) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
                <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Peer Comparison Data Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Need more users with similar profiles to generate comparisons.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Check back as our community grows!
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header with Peer Count */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        Peer Comparison
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Compared with {data.peer_count?.toLocaleString()} similar users
                    </p>
                </div>

                {/* Chart View Toggle */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                        onClick={() => setChartView('radar')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${chartView === 'radar'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                    >
                        Radar View
                    </button>
                    <button
                        onClick={() => setChartView('bar')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${chartView === 'bar'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                            }`}
                    >
                        Bar View
                    </button>
                </div>
            </div>

            {/* Summary Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600 dark:text-blue-400">Your Risk</span>
                        <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {data.user_risk?.toFixed(1)}%
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-600 dark:text-purple-400">Peer Average</span>
                        <UserGroupIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {data.peer_average?.toFixed(1)}%
                    </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-orange-600 dark:text-orange-400">Difference</span>
                        {comparisonStats && getStatusIcon(comparisonStats.status)}
                    </div>
                    <p className={`text-2xl font-bold ${comparisonStats?.difference < 0
                            ? 'text-green-600 dark:text-green-400'
                            : comparisonStats?.difference > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                        {comparisonStats?.difference > 0 ? '+' : ''}{comparisonStats?.difference?.toFixed(1)}%
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-600 dark:text-green-400">Percentile</span>
                        <ChartBarIcon className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {data.percentile?.toFixed(0)}th
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {data.percentile < 30 ? 'Top performer' : data.percentile > 70 ? 'Needs improvement' : 'Average'}
                    </p>
                </div>
            </motion.div>

            {/* Main Charts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
                {chartView === 'radar' ? (
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    tick={{ fill: '#6B7280', fontSize: 10 }}
                                />
                                <Radar
                                    name="You"
                                    dataKey="user"
                                    stroke="#0ea5e9"
                                    fill="#0ea5e9"
                                    fillOpacity={0.6}
                                    activeDot={{ r: 8 }}
                                    onClick={(data) => setSelectedMetric(data)}
                                />
                                <Radar
                                    name="Peers"
                                    dataKey="peer"
                                    stroke="#f59e0b"
                                    fill="#f59e0b"
                                    fillOpacity={0.4}
                                    activeDot={{ r: 8 }}
                                    onClick={(data) => setSelectedMetric(data)}
                                />
                                <Legend
                                    wrapperStyle={{
                                        color: '#6B7280',
                                        paddingTop: '20px'
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={factorData}
                                layout="vertical"
                                margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    stroke="#6B7280"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis
                                    dataKey="factor"
                                    type="category"
                                    width={100}
                                    stroke="#6B7280"
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="user" fill="#0ea5e9" name="You" radius={[0, 4, 4, 0]}>
                                    <LabelList
                                        dataKey="user"
                                        position="right"
                                        formatter={(value) => `${value.toFixed(0)}%`}
                                        style={{ fill: '#6B7280', fontSize: 11 }}
                                    />
                                </Bar>
                                <Bar dataKey="peer" fill="#f59e0b" name="Peers" radius={[0, 4, 4, 0]}>
                                    <LabelList
                                        dataKey="peer"
                                        position="right"
                                        formatter={(value) => `${value.toFixed(0)}%`}
                                        style={{ fill: '#6B7280', fontSize: 11 }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>

            {/* Selected Metric Details */}
            {selectedMetric && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
                >
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                            {getMetricIcon(selectedMetric.subject)}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                                {selectedMetric.subject} Analysis
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                                {selectedMetric.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-blue-600 dark:text-blue-400">Your value:</span>
                                    <span className="ml-2 font-medium text-blue-900 dark:text-blue-300">
                                        {selectedMetric.user?.toFixed(1)}
                                        {selectedMetric.subject === 'BMI' ? '' : '%'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-blue-600 dark:text-blue-400">Peer average:</span>
                                    <span className="ml-2 font-medium text-blue-900 dark:text-blue-300">
                                        {selectedMetric.peer?.toFixed(1)}
                                        {selectedMetric.subject === 'BMI' ? '' : '%'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedMetric(null)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Detailed Comparison Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                    Detailed Comparison
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Peer Statistics */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Peer Group Size</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {data.peer_count?.toLocaleString()} users
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Age Range</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {data.peer_age_range?.[0] || 25} - {data.peer_age_range?.[1] || 65} years
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Gender Distribution</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {data.gender_distribution || 'Mixed'}
                            </span>
                        </div>
                    </div>

                    {/* Risk Statistics */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Peer Risk Range</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {data.peer_range?.[0]?.toFixed(1)}% - {data.peer_range?.[1]?.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Median Risk</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {data.peer_median?.toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-600 dark:text-gray-400">Standard Deviation</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                ±{data.peer_std_dev?.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Your Position */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {comparisonStats && getStatusIcon(comparisonStats.status)}
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Your Position</p>
                                <p className={`text-lg font-semibold ${comparisonStats?.status === 'better'
                                        ? 'text-green-600 dark:text-green-400'
                                        : comparisonStats?.status === 'worse'
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-yellow-600 dark:text-yellow-400'
                                    }`}>
                                    {comparisonStats?.status === 'better' && 'Better than average'}
                                    {comparisonStats?.status === 'worse' && 'Worse than average'}
                                    {comparisonStats?.status === 'similar' && 'Similar to average'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Risk Gap</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {comparisonStats?.riskGap?.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800"
            >
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5" />
                    Personalized Insights
                </h4>
                <ul className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
                    {data.insights?.map((insight, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-start space-x-2"
                        >
                            <span className="text-purple-500">•</span>
                            <span>{insight}</span>
                        </motion.li>
                    )) || (
                            <>
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-start space-x-2"
                                >
                                    <span className="text-purple-500">•</span>
                                    <span>You're in the <strong>{data.percentile?.toFixed(0)}th percentile</strong> among {data.peer_count} similar users</span>
                                </motion.li>
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-start space-x-2"
                                >
                                    <span className="text-purple-500">•</span>
                                    <span>Your risk is <strong>{comparisonStats?.status === 'better' ? 'lower' : comparisonStats?.status === 'worse' ? 'higher' : 'similar'}</strong> than your peers</span>
                                </motion.li>
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex items-start space-x-2"
                                >
                                    <span className="text-purple-500">•</span>
                                    <span>Focus on improving factors where you're below peer average for the biggest impact</span>
                                </motion.li>
                            </>
                        )}
                </ul>
            </motion.div>
        </motion.div>
    );
};

PeerComparison.propTypes = {
    data: PropTypes.shape({
        user_risk: PropTypes.number,
        peer_average: PropTypes.number,
        peer_count: PropTypes.number,
        percentile: PropTypes.number,
        user_bmi: PropTypes.number,
        peer_bmi: PropTypes.number,
        user_activity: PropTypes.number,
        peer_activity: PropTypes.number,
        user_diet: PropTypes.number,
        peer_diet: PropTypes.number,
        user_sleep: PropTypes.number,
        peer_sleep: PropTypes.number,
        factor_comparison: PropTypes.arrayOf(PropTypes.shape({
            factor: PropTypes.string,
            user: PropTypes.number,
            peer: PropTypes.number
        })),
        peer_range: PropTypes.arrayOf(PropTypes.number),
        peer_median: PropTypes.number,
        peer_std_dev: PropTypes.number,
        peer_age_range: PropTypes.arrayOf(PropTypes.number),
        gender_distribution: PropTypes.string,
        insights: PropTypes.arrayOf(PropTypes.string)
    })
};

export default PeerComparison;