// src/pages/analytics/PeerComparison.jsx
import React from 'react';
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
    Tooltip
} from 'recharts';

const PeerComparison = ({ data = null }) => {
    // Sample data for demo
    const defaultData = {
        percentile: 65,
        peers: [
            { category: 'Age', your_value: 45, peer_avg: 42 },
            { category: 'BMI', your_value: 26.5, peer_avg: 27.1 },
            { category: 'Activity', your_value: 7, peer_avg: 6.5 },
            { category: 'Sleep', your_value: 7.5, peer_avg: 7.2 },
            { category: 'Stress', your_value: 4, peer_avg: 5 },
            { category: 'Risk', your_value: 15, peer_avg: 18 }
        ]
    };

    const chartData = data?.peers?.length ? data.peers : defaultData.peers;
    const percentile = data?.percentile || defaultData.percentile;

    // Format for radar chart
    const radarData = chartData.map(item => ({
        subject: item.category,
        you: item.your_value,
        peer: item.peer_avg,
        fullMark: Math.max(item.your_value, item.peer_avg) * 1.2
    }));

    return (
        <div className="w-full">
            <div className="text-center mb-6">
                <div className="inline-block bg-blue-50 px-4 py-2 rounded-full">
                    <span className="text-sm text-gray-600">You are in the </span>
                    <span className="text-2xl font-bold text-blue-600 mx-1">{percentile}th</span>
                    <span className="text-sm text-gray-600">percentile</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    This means you're doing better than {percentile}% of people like you
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Radar Chart - Easy to understand comparison */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">How you compare (radar view)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fontSize: 10, fill: '#4b5563' }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 'auto']}
                                    tick={{ fontSize: 10 }}
                                    stroke="#d1d5db"
                                />
                                <Radar
                                    name="You"
                                    dataKey="you"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="Peers (similar people)"
                                    dataKey="peer"
                                    stroke="#9ca3af"
                                    fill="#9ca3af"
                                    fillOpacity={0.3}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart - Simple side-by-side comparison */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Side by side comparison</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="category"
                                    tick={{ fontSize: 10 }}
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip
                                    contentStyle={{ fontSize: '11px' }}
                                    formatter={(value) => [value, '']}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Bar
                                    dataKey="your_value"
                                    name="You"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="peer_avg"
                                    name="Peers"
                                    fill="#9ca3af"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Simple interpretation guide */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">📊 What this means:</h5>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                        <span className="w-4 h-4 bg-blue-500 rounded-full mt-0.5 flex-shrink-0"></span>
                        <span><strong>Blue = You</strong> - Your values in each category</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-4 h-4 bg-gray-400 rounded-full mt-0.5 flex-shrink-0"></span>
                        <span><strong>Gray = Peers</strong> - Average values for people like you</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <InformationCircleIcon className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>If your bar is taller/lighter color, you're above average. If shorter/darker, you're below average.</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default PeerComparison;