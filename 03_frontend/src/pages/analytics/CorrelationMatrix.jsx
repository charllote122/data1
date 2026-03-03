import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
    Legend
} from 'recharts';
import {
    InformationCircleIcon,
    ChartBarIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    MinusIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const CorrelationMatrix = ({ data }) => {
    const [selectedFactor, setSelectedFactor] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'heatmap'
    const [sortBy, setSortBy] = useState('strength'); // 'strength' or 'factor'
    const [filterStrength, setFilterStrength] = useState('all'); // 'all', 'strong', 'moderate', 'weak'

    // Memoized correlation colors
    const getCorrelationColor = useCallback((value) => {
        const abs = Math.abs(value);
        if (abs > 0.7) return value > 0 ? '#ef4444' : '#10b981';
        if (abs > 0.5) return value > 0 ? '#f97316' : '#34d399';
        if (abs > 0.3) return value > 0 ? '#fbbf24' : '#6ee7b7';
        return '#9ca3af';
    }, []);

    const getStrengthLabel = useCallback((value) => {
        const abs = Math.abs(value);
        if (abs > 0.7) return 'Strong';
        if (abs > 0.5) return 'Moderate';
        if (abs > 0.3) return 'Weak';
        return 'Very Weak';
    }, []);

    const getStrengthCategory = useCallback((value) => {
        const abs = Math.abs(value);
        if (abs > 0.7) return 'strong';
        if (abs > 0.5) return 'moderate';
        if (abs > 0.3) return 'weak';
        return 'very-weak';
    }, []);

    // Filter and sort correlations
    const filteredCorrelations = useMemo(() => {
        if (!data?.correlations) return [];

        let filtered = [...data.correlations];

        // Apply strength filter
        if (filterStrength !== 'all') {
            filtered = filtered.filter(corr =>
                getStrengthCategory(corr.correlation) === filterStrength
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (sortBy === 'strength') {
                return Math.abs(b.correlation) - Math.abs(a.correlation);
            }
            // Sort by factor name
            return a.factor1.localeCompare(b.factor1);
        });

        return filtered;
    }, [data, filterStrength, sortBy, getStrengthCategory]);

    // Calculate statistics
    const statistics = useMemo(() => {
        if (!data?.correlations) return null;

        const correlations = data.correlations.map(c => c.correlation);
        const positive = correlations.filter(c => c > 0).length;
        const negative = correlations.filter(c => c < 0).length;
        const strong = correlations.filter(c => Math.abs(c) > 0.7).length;
        const avgCorrelation = correlations.reduce((a, b) => a + Math.abs(b), 0) / correlations.length;

        return {
            total: correlations.length,
            positive,
            negative,
            strong,
            avgCorrelation: avgCorrelation.toFixed(2),
            strongest: data.correlations.reduce((max, c) =>
                Math.abs(c.correlation) > Math.abs(max.correlation) ? c : max
                , data.correlations[0]),
            weakest: data.correlations.reduce((min, c) =>
                Math.abs(c.correlation) < Math.abs(min.correlation) ? c : min
                , data.correlations[0]),
        };
    }, [data]);

    if (!data || !data.correlations || data.correlations.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
            >
                <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Correlation Data Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Need at least 5 predictions to calculate correlations between factors.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Complete more assessments to unlock correlation insights.
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
            {/* Header with Statistics */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Risk Factor Correlation Matrix
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Discover how different health factors relate to each other
                    </p>
                </div>

                {statistics && (
                    <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{statistics.total}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Strong</p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{statistics.strong}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Avg</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{statistics.avgCorrelation}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('heatmap')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'heatmap'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                        >
                            Heatmap
                        </button>
                    </div>

                    {/* Sort Options */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="strength">Sort by Strength</option>
                        <option value="factor">Sort by Factor</option>
                    </select>

                    {/* Filter Options */}
                    <select
                        value={filterStrength}
                        onChange={(e) => setFilterStrength(e.target.value)}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                        <option value="all">All Correlations</option>
                        <option value="strong">Strong Only</option>
                        <option value="moderate">Moderate Only</option>
                        <option value="weak">Weak Only</option>
                    </select>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Strong +</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Moderate +</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Weak +</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-400 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">None</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600 dark:text-gray-400">Negative</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Correlation List */}
                <div className="lg:col-span-1 space-y-4">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center justify-between">
                        <span>Top Correlations</span>
                        <span className="text-xs text-gray-500">{filteredCorrelations.length} of {data.correlations.length}</span>
                    </h4>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {filteredCorrelations.map((corr, index) => (
                            <motion.div
                                key={`${corr.factor1}-${corr.factor2}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedFactor === index
                                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:ring-blue-400 dark:bg-blue-900/20'
                                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                onClick={() => setSelectedFactor(index)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{corr.factor1}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mx-2">vs</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{corr.factor2}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: getCorrelationColor(corr.correlation) }}
                                        >
                                            {corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}
                                        </span>
                                        {Math.abs(corr.correlation) > 0.7 && (
                                            <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />
                                        )}
                                        {Math.abs(corr.correlation) > 0.3 && Math.abs(corr.correlation) <= 0.7 && corr.correlation > 0 && (
                                            <ArrowTrendingUpIcon className="w-4 h-4 text-orange-500" />
                                        )}
                                        {corr.correlation < 0 && (
                                            <ArrowTrendingDownIcon className="w-4 h-4 text-green-500" />
                                        )}
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-white dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                                        {corr.strength || getStrengthLabel(corr.correlation)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Statistics Summary */}
                    {statistics && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Stats</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white dark:bg-gray-600 rounded p-2">
                                    <p className="text-gray-500 dark:text-gray-400">Strongest</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate" title={`${statistics.strongest.factor1} vs ${statistics.strongest.factor2}`}>
                                        {statistics.strongest.correlation.toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-600 rounded p-2">
                                    <p className="text-gray-500 dark:text-gray-400">Weakest</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {Math.abs(statistics.weakest.correlation).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-600 rounded p-2">
                                    <p className="text-gray-500 dark:text-gray-400">Positive</p>
                                    <p className="font-medium text-green-600">{statistics.positive}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-600 rounded p-2">
                                    <p className="text-gray-500 dark:text-gray-400">Negative</p>
                                    <p className="font-medium text-red-600">{statistics.negative}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Visualization */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {viewMode === 'list' ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {selectedFactor !== null ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                {data.correlations[selectedFactor].factor1} vs {data.correlations[selectedFactor].factor2}
                                            </h4>
                                            <button
                                                onClick={() => setSelectedFactor(null)}
                                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                            >
                                                <ArrowsPointingOutIcon className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>

                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                    <XAxis
                                                        dataKey="x"
                                                        name={data.correlations[selectedFactor].factor1}
                                                        domain={['auto', 'auto']}
                                                        stroke="#6B7280"
                                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                                    />
                                                    <YAxis
                                                        dataKey="y"
                                                        name={data.correlations[selectedFactor].factor2}
                                                        domain={['auto', 'auto']}
                                                        stroke="#6B7280"
                                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                                    />
                                                    <ZAxis range={[50]} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1F2937',
                                                            border: '1px solid #374151',
                                                            borderRadius: '0.5rem',
                                                            color: '#F3F4F6'
                                                        }}
                                                        formatter={(value, name) => [value.toFixed(2), name]}
                                                    />
                                                    <ReferenceLine y={0} stroke="#374151" />
                                                    <ReferenceLine x={0} stroke="#374151" />
                                                    <Scatter
                                                        name="Data Points"
                                                        data={data.scatter_data?.[selectedFactor] || []}
                                                        fill="#3B82F6"
                                                        shape="circle"
                                                    />
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <div className="flex items-start space-x-2">
                                                <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="font-medium">Interpretation:</span> There is a{' '}
                                                        <span style={{ color: getCorrelationColor(data.correlations[selectedFactor].correlation) }}>
                                                            {data.correlations[selectedFactor].strength?.toLowerCase() ||
                                                                getStrengthLabel(data.correlations[selectedFactor].correlation).toLowerCase()}
                                                        </span>{' '}
                                                        {data.correlations[selectedFactor].correlation > 0 ? 'positive' : 'negative'} correlation
                                                        of <strong>{(data.correlations[selectedFactor].correlation * 100).toFixed(1)}%</strong>.
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {data.correlations[selectedFactor].correlation > 0
                                                            ? `As ${data.correlations[selectedFactor].factor1} increases, ${data.correlations[selectedFactor].factor2} tends to increase.`
                                                            : `As ${data.correlations[selectedFactor].factor1} increases, ${data.correlations[selectedFactor].factor2} tends to decrease.`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center h-full flex items-center justify-center">
                                        <div>
                                            <ArrowsPointingInIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600 dark:text-gray-400 mb-2">Select a correlation from the list</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                                Click on any correlation to see detailed visualization
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="heatmap"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                            >
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Correlation Heatmap</h4>
                                {data.heatmap_data ? (
                                    <>
                                        <div className="grid gap-1 max-w-md mx-auto" style={{
                                            gridTemplateColumns: `repeat(${data.heatmap_data.factors?.length || 8}, 1fr)`
                                        }}>
                                            {data.heatmap_data.factors?.map((factor, i) => (
                                                <div key={`label-${i}`} className="text-center">
                                                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 transform -rotate-45 origin-top-left whitespace-nowrap mt-8">
                                                        {factor}
                                                    </div>
                                                </div>
                                            ))}
                                            {data.heatmap_data.values?.map((row, i) => (
                                                <React.Fragment key={i}>
                                                    {row.map((value, j) => (
                                                        <div
                                                            key={`${i}-${j}`}
                                                            className="aspect-square rounded cursor-help transition-transform hover:scale-110"
                                                            style={{
                                                                backgroundColor: getCorrelationColor(value),
                                                                opacity: Math.abs(value) * 0.8 + 0.2,
                                                            }}
                                                            title={`${data.heatmap_data.factors[i]} vs ${data.heatmap_data.factors[j]}: ${value.toFixed(2)}`}
                                                        />
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                                            Each cell represents correlation between two factors
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        Heatmap data not available
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800"
            >
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5" />
                    Actionable Insights
                </h4>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    {data.insights?.map((insight, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-start space-x-2"
                        >
                            <span className="text-blue-500">•</span>
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
                                    <span className="text-blue-500">•</span>
                                    <span>Focus on factors with strong correlations to your risk level for maximum impact</span>
                                </motion.li>
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-start space-x-2"
                                >
                                    <span className="text-blue-500">•</span>
                                    <span>Improving one factor may positively impact correlated factors - work on clusters</span>
                                </motion.li>
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex items-start space-x-2"
                                >
                                    <span className="text-blue-500">•</span>
                                    <span>Track changes in negatively correlated factors (as one goes up, the other goes down)</span>
                                </motion.li>
                            </>
                        )}
                </ul>
            </motion.div>
        </motion.div>
    );
};

CorrelationMatrix.propTypes = {
    data: PropTypes.shape({
        correlations: PropTypes.arrayOf(PropTypes.shape({
            factor1: PropTypes.string.isRequired,
            factor2: PropTypes.string.isRequired,
            correlation: PropTypes.number.isRequired,
            strength: PropTypes.string,
        })),
        scatter_data: PropTypes.arrayOf(PropTypes.array),
        heatmap_data: PropTypes.shape({
            factors: PropTypes.arrayOf(PropTypes.string),
            values: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
        }),
        insights: PropTypes.arrayOf(PropTypes.string),
    }),
};

// Add custom scrollbar styles
const styles = `
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #555;
}
.dark .custom-scrollbar::-webkit-scrollbar-track {
    background: #374151;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #6B7280;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

export default CorrelationMatrix;