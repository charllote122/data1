// src/pages/analytics/CorrelationMatrix.jsx
import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const CorrelationMatrix = ({ data = null }) => {
    // Sample data for demo
    const defaultData = {
        factors: ['Age', 'BMI', 'Smoking', 'Activity', 'Diet', 'Sleep', 'Stress'],
        correlations: [
            [1.0, 0.4, 0.2, -0.3, -0.2, -0.1, 0.3],  // Age
            [0.4, 1.0, 0.3, -0.4, -0.3, -0.2, 0.2],  // BMI
            [0.2, 0.3, 1.0, -0.5, -0.3, -0.3, 0.4],  // Smoking
            [-0.3, -0.4, -0.5, 1.0, 0.4, 0.3, -0.3], // Activity
            [-0.2, -0.3, -0.3, 0.4, 1.0, 0.3, -0.2], // Diet
            [-0.1, -0.2, -0.3, 0.3, 0.3, 1.0, -0.4], // Sleep
            [0.3, 0.2, 0.4, -0.3, -0.2, -0.4, 1.0],  // Stress
        ]
    };

    const factors = data?.factors?.length ? data.factors : defaultData.factors;
    const correlations = data?.correlations?.length ? data.correlations : defaultData.correlations;

    // Function to get color based on correlation value
    const getColor = (value) => {
        if (value === 0) return 'bg-gray-100';
        if (value > 0) {
            // Positive correlation (red scale)
            const intensity = Math.min(Math.abs(value) * 100, 100);
            return `bg-red-${Math.min(Math.floor(intensity / 10) * 100, 900)}`;
        } else {
            // Negative correlation (blue scale)
            const intensity = Math.min(Math.abs(value) * 100, 100);
            return `bg-blue-${Math.min(Math.floor(intensity / 10) * 100, 900)}`;
        }
    };

    // Fallback for Tailwind colors
    const getColorClass = (value) => {
        const abs = Math.abs(value);
        if (abs < 0.2) return 'bg-gray-100';
        if (abs < 0.4) return value > 0 ? 'bg-red-200' : 'bg-blue-200';
        if (abs < 0.6) return value > 0 ? 'bg-red-400' : 'bg-blue-400';
        if (abs < 0.8) return value > 0 ? 'bg-red-600' : 'bg-blue-600';
        return value > 0 ? 'bg-red-800' : 'bg-blue-800';
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What affects your risk?</h3>

            {/* Simple explanation */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How to read this chart:</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li><span className="font-medium">Red squares</span> = factors that increase together</li>
                            <li><span className="font-medium">Blue squares</span> = when one goes up, the other goes down</li>
                            <li><span className="font-medium">Darker color</span> = stronger relationship</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Correlation Matrix */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="p-2 border bg-gray-50"></th>
                            {factors.map((factor, i) => (
                                <th key={i} className="p-2 text-xs font-medium text-gray-700 border bg-gray-50">
                                    {factor}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {factors.map((rowFactor, i) => (
                            <tr key={i}>
                                <td className="p-2 text-xs font-medium text-gray-700 border bg-gray-50">
                                    {rowFactor}
                                </td>
                                {factors.map((colFactor, j) => {
                                    const value = correlations[i]?.[j] || 0;
                                    return (
                                        <td
                                            key={j}
                                            className={`p-2 text-center border ${getColorClass(value)}`}
                                            style={{
                                                color: Math.abs(value) > 0.6 ? 'white' : 'inherit',
                                                fontWeight: 'medium'
                                            }}
                                        >
                                            <span className="text-xs">
                                                {value.toFixed(2)}
                                            </span>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple interpretation guide */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="font-medium text-red-800">Positive correlation</span>
                    </div>
                    <p className="text-red-700">When one factor goes up, the other tends to go up too.</p>
                    <p className="text-red-600 mt-1">Example: Age and risk often increase together.</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="font-medium text-blue-800">Negative correlation</span>
                    </div>
                    <p className="text-blue-700">When one factor goes up, the other tends to go down.</p>
                    <p className="text-blue-600 mt-1">Example: More exercise usually means lower risk.</p>
                </div>
            </div>

            {/* Key insights */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">💡 Key insights for you:</h5>
                <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                        <span><strong>BMI and Activity</strong> have a strong negative correlation (-0.4) - staying active helps maintain healthy weight</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                        <span><strong>Smoking and Stress</strong> show positive correlation (0.4) - managing stress may help reduce smoking</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2"></span>
                        <span><strong>Diet and Sleep</strong> are moderately correlated (0.3) - good nutrition often means better sleep</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default CorrelationMatrix;