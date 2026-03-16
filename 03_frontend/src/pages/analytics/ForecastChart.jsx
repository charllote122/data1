// src/pages/analytics/ForecastChart.jsx
import React from 'react';
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
    AreaChart
} from 'recharts';

const ForecastChart = ({ data = null }) => {
    // If no data, show sample data for demo
    const chartData = data?.forecast?.length ? data.forecast : [
        { date: 'Jan', actual: 15, predicted: 16, upper: 18, lower: 14 },
        { date: 'Feb', actual: 16, predicted: 17, upper: 19, lower: 15 },
        { date: 'Mar', actual: 14, predicted: 15, upper: 17, lower: 13 },
        { date: 'Apr', actual: 17, predicted: 16, upper: 18, lower: 14 },
        { date: 'May', actual: 15, predicted: 14, upper: 16, lower: 12 },
        { date: 'Jun', predicted: 15, upper: 18, lower: 12 },
        { date: 'Jul', predicted: 16, upper: 19, lower: 13 },
        { date: 'Aug', predicted: 17, upper: 20, lower: 14 },
    ];

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Forecast</h3>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 30]}
                            label={{ value: 'Risk %', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />

                        {/* Confidence interval */}
                        <Area
                            type="monotone"
                            dataKey="upper"
                            stroke="none"
                            fill="#8884d8"
                            fillOpacity={0.1}
                            name="Confidence Range"
                        />
                        <Area
                            type="monotone"
                            dataKey="lower"
                            stroke="none"
                            fill="#8884d8"
                            fillOpacity={0.1}
                        />

                        {/* Actual vs Predicted lines */}
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4, fill: '#3b82f6' }}
                            activeDot={{ r: 6 }}
                            name="Actual Risk"
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4, fill: '#f59e0b' }}
                            name="Predicted Risk"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Simple legend explanation */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span>Your actual risk (past)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span>Predicted risk (future)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-6 h-3 bg-purple-200 rounded"></span>
                    <span>Possible range (confidence interval)</span>
                </div>
            </div>
        </div>
    );
};

export default ForecastChart;