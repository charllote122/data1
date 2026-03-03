// src/pages/history/components/TrendChart.jsx
import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const TrendChart = ({ predictions }) => {
    // Sort predictions by date
    const chartData = [...predictions]
        .sort((a, b) => new Date(a.created_at || a.prediction_date || a.date) - new Date(b.created_at || b.prediction_date || b.date))
        .map(pred => ({
            date: new Date(pred.created_at || pred.prediction_date || pred.date).toLocaleDateString(),
            risk: pred.risk_score || (pred.probability * 100) || 0,
            level: pred.risk_level || pred.result
        }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-600">
                        Risk Score: <span className="font-semibold">{payload[0].value.toFixed(1)}%</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Level: <span className="font-semibold">{payload[0].payload.level}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <p className="text-gray-500">No data available for chart</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Trends</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="risk"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6, fill: '#3b82f6' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;