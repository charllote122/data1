import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart,
    ReferenceLine,
    Brush
} from 'recharts';
import {
    CalendarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MinusIcon,
    InformationCircleIcon,
    ChartBarIcon,
    ClockIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ForecastChart = ({ data, dateRange }) => {
    const [showConfidence, setShowConfidence] = useState(true);
    const [chartType, setChartType] = useState('composed'); // 'composed' or 'line'

    // Memoized chart data
    const chartData = useMemo(() => {
        if (!data) return [];

        const historical = (data.historical || []).map(item => ({
            ...item,
            type: 'historical',
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));

        const forecast = (data.forecast || []).map(item => ({
            ...item,
            type: 'forecast',
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));

        return [...historical, ...forecast];
    }, [data]);

    // Calculate statistics
    const statistics = useMemo(() => {
        if (!data?.forecast?.length) return null;

        const lastHistorical = data.historical?.[data.historical.length - 1]?.risk || 0;
        const lastForecast = data.forecast[data.forecast.length - 1]?.risk || 0;
        const change = lastForecast - lastHistorical;
        const percentChange = lastHistorical ? (change / lastHistorical) * 100 : 0;

        const maxRisk = Math.max(
            ...(data.historical?.map(d => d.risk) || []),
            ...(data.forecast?.map(d => d.risk) || [])
        );
        const minRisk = Math.min(
            ...(data.historical?.map(d => d.risk) || []),
            ...(data.forecast?.map(d => d.risk) || [])
        );

        return {
            current: lastHistorical,
            forecast: lastForecast,
            change,
            percentChange,
            maxRisk,
            minRisk,
            range: maxRisk - minRisk,
            direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
            confidence: data.confidence || 'medium'
        };
    }, [data]);

    const getConfidenceColor = (confidence) => {
        switch (confidence?.toLowerCase()) {
            case 'high':
                return 'text-green-600 dark:text-green-400';
            case 'medium':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'low':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getTrendIcon = (direction) => {
        switch (direction) {
            case 'increasing':
                return <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />;
            case 'decreasing':
                return <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />;
            default:
                return <MinusIcon className="w-5 h-5 text-yellow-500" />;
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0]?.payload;
            const isForecast = dataPoint?.type === 'forecast';
            const confidence = dataPoint?.confidence || statistics?.confidence;

            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 min-w-[200px]"
                >
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        {label}
                    </p>

                    {payload.map((entry, index) => (
                        <div key={index} className="text-sm mb-1">
                            <span style={{ color: entry.color }}>{entry.name}: </span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">
                                {entry.value?.toFixed(1)}%
                            </span>
                        </div>
                    ))}

                    {isForecast && (
                        <>
                            {dataPoint?.upper_bound && dataPoint?.lower_bound && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Range: {dataPoint.lower_bound.toFixed(1)}% - {dataPoint.upper_bound.toFixed(1)}%
                                    </p>
                                </div>
                            )}
                            <div className="mt-1 flex items-center gap-1">
                                <ShieldCheckIcon className={`w-4 h-4 ${getConfidenceColor(confidence)}`} />
                                <span className={`text-xs capitalize ${getConfidenceColor(confidence)}`}>
                                    {confidence} confidence
                                </span>
                            </div>
                        </>
                    )}
                </motion.div>
            );
        }
        return null;
    };

    if (!data || !data.forecast || data.forecast.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Forecast Data Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Need at least 10 historical predictions to generate a forecast.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Complete more assessments to unlock predictive insights.
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
            {/* Header with Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        3-Month Risk Forecast
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Predicted risk trend based on your historical data
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Chart Type Toggle */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setChartType('composed')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${chartType === 'composed'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                        >
                            Composed
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${chartType === 'line'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                        >
                            Line
                        </button>
                    </div>

                    {/* Confidence Toggle */}
                    <button
                        onClick={() => setShowConfidence(!showConfidence)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${showConfidence
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Show Confidence
                    </button>
                </div>
            </div>

            {/* Main Chart */}
            <div className="h-96 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'composed' ? (
                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickLine={{ stroke: '#6B7280' }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                stroke="#6B7280"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickLine={{ stroke: '#6B7280' }}
                                label={{
                                    value: 'Risk Score (%)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { fill: '#6B7280', fontSize: 12 }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{
                                    color: '#6B7280',
                                    paddingTop: '10px'
                                }}
                            />

                            {/* Risk thresholds */}
                            <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Low', position: 'right', fill: '#10B981' }} />
                            <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'High', position: 'right', fill: '#EF4444' }} />

                            {/* Historical data line */}
                            <Line
                                type="monotone"
                                dataKey="risk"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                                name="Historical Risk"
                                data={chartData.filter(d => d.type === 'historical')}
                                connectNulls
                            />

                            {/* Forecast line */}
                            <Line
                                type="monotone"
                                dataKey="risk"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
                                activeDot={{ r: 6, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
                                name="Forecasted Risk"
                                data={chartData.filter(d => d.type === 'forecast')}
                                connectNulls
                            />

                            {/* Confidence interval area */}
                            {showConfidence && (
                                <>
                                    <Area
                                        type="monotone"
                                        dataKey="upper_bound"
                                        stroke="none"
                                        fill="#F59E0B"
                                        fillOpacity={0.2}
                                        name="Confidence Range"
                                        data={chartData.filter(d => d.type === 'forecast')}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="lower_bound"
                                        stroke="none"
                                        fill="#F59E0B"
                                        fillOpacity={0.2}
                                        name=""
                                        data={chartData.filter(d => d.type === 'forecast')}
                                    />
                                </>
                            )}

                            {/* Brush for timeline navigation */}
                            <Brush
                                dataKey="date"
                                height={30}
                                stroke="#6B7280"
                                fill="#1F2937"
                                travellerWidth={10}
                            />
                        </ComposedChart>
                    ) : (
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                stroke="#6B7280"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" />
                            <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" />
                            <Line
                                type="monotone"
                                dataKey="risk"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name="Risk Score"
                            />
                            <Brush dataKey="date" height={30} stroke="#6B7280" />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-600 dark:text-blue-400">Current Risk</span>
                            <ChartBarIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {statistics.current?.toFixed(1)}%
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-orange-600 dark:text-orange-400">Forecast (3mo)</span>
                            <ClockIcon className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                            {statistics.forecast?.toFixed(1)}%
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-purple-600 dark:text-purple-400">Expected Change</span>
                            {getTrendIcon(statistics.direction)}
                        </div>
                        <p className={`text-2xl font-bold ${statistics.change > 0
                                ? 'text-red-600 dark:text-red-400'
                                : statistics.change < 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-yellow-600 dark:text-yellow-400'
                            }`}>
                            {statistics.change > 0 ? '+' : ''}{statistics.change?.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {statistics.percentChange?.toFixed(1)}% relative change
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-green-600 dark:text-green-400">Confidence</span>
                            <ShieldCheckIcon className={`w-5 h-5 ${getConfidenceColor(statistics.confidence)}`} />
                        </div>
                        <p className={`text-2xl font-bold capitalize ${getConfidenceColor(statistics.confidence)}`}>
                            {statistics.confidence}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Trend Analysis */}
            {data.trend_analysis && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
                >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5 text-blue-500" />
                        Trend Analysis
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Direction:</span>{' '}
                            <span className={`font-medium capitalize flex items-center gap-1 ${data.trend_analysis.direction === 'improving'
                                    ? 'text-green-600 dark:text-green-400'
                                    : data.trend_analysis.direction === 'worsening'
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-yellow-600 dark:text-yellow-400'
                                }`}>
                                {getTrendIcon(data.trend_analysis.direction)}
                                {data.trend_analysis.direction}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Magnitude:</span>{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {data.trend_analysis.magnitude?.toFixed(1)}%
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Target Category:</span>{' '}
                            <span className={`font-medium capitalize ${data.trend_analysis.target_risk === 'low'
                                    ? 'text-green-600'
                                    : data.trend_analysis.target_risk === 'high'
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                }`}>
                                {data.trend_analysis.target_risk}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Model Accuracy:</span>{' '}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {data.model_accuracy?.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Action Items */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800"
            >
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Recommended Actions
                </h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    {statistics?.direction === 'increasing' && statistics.change > 5 ? (
                        <>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>⚠️ <strong>Urgent:</strong> Schedule a consultation with your healthcare provider within the next 2 weeks</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>Review and address the top risk factors from your latest assessment</span>
                            </li>
                        </>
                    ) : statistics?.direction === 'decreasing' && statistics.change < -5 ? (
                        <>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>✅ <strong>Great progress!</strong> Continue your current health routine</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>Share your success with your healthcare provider</span>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>Schedule a follow-up assessment in 1 month to monitor your progress</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span>•</span>
                                <span>Focus on the top risk factors identified in your latest assessment</span>
                            </li>
                        </>
                    )}
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Consider consulting with a healthcare provider for personalized advice</span>
                    </li>
                </ul>
            </motion.div>

            {/* Model Information */}
            <div className="text-xs text-gray-500 dark:text-gray-500 text-right">
                Forecast based on {data.historical?.length || 0} historical data points
                {data.model_version && ` | Model v${data.model_version}`}
                {data.generated_at && ` | Generated ${new Date(data.generated_at).toLocaleString()}`}
            </div>
        </motion.div>
    );
};

ForecastChart.propTypes = {
    data: PropTypes.shape({
        historical: PropTypes.arrayOf(PropTypes.shape({
            date: PropTypes.string.isRequired,
            risk: PropTypes.number.isRequired
        })),
        forecast: PropTypes.arrayOf(PropTypes.shape({
            date: PropTypes.string.isRequired,
            risk: PropTypes.number.isRequired,
            upper_bound: PropTypes.number,
            lower_bound: PropTypes.number,
            confidence: PropTypes.string
        })),
        trend_analysis: PropTypes.shape({
            direction: PropTypes.string,
            magnitude: PropTypes.number,
            target_risk: PropTypes.string
        }),
        confidence: PropTypes.string,
        model_accuracy: PropTypes.number,
        model_version: PropTypes.string,
        generated_at: PropTypes.string
    }),
    dateRange: PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string
    })
};

export default ForecastChart;