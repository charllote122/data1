import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DocumentTextIcon,
    PlusIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const SymptomChecker = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState(null);
    const [formData, setFormData] = useState({
        type: 'fatigue',
        severity: 5,
        notes: '',
    });

    const symptomTypes = [
        { id: 'fatigue', name: 'Fatigue', emoji: '😴' },
        { id: 'increased_thirst', name: 'Increased Thirst', emoji: '💧' },
        { id: 'frequent_urination', name: 'Frequent Urination', emoji: '🚽' },
        { id: 'blurred_vision', name: 'Blurred Vision', emoji: '👓' },
        { id: 'headache', name: 'Headache', emoji: '🤕' },
        { id: 'dizziness', name: 'Dizziness', emoji: '😵' },
        { id: 'numbness', name: 'Numbness', emoji: '🖐️' },
        { id: 'slow_healing', name: 'Slow Healing', emoji: '🩹' },
        { id: 'weight_loss', name: 'Unexplained Weight Loss', emoji: '⚖️' },
        { id: 'hunger', name: 'Increased Hunger', emoji: '🍽️' },
    ];

    // Mock data - replace with actual API calls
    useState(() => {
        const mockSymptoms = [
            {
                id: 1,
                type: 'fatigue',
                severity: 7,
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                notes: 'Feeling very tired after work',
            },
            {
                id: 2,
                type: 'headache',
                severity: 4,
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                notes: 'Mild headache in the morning',
            },
            {
                id: 3,
                type: 'increased_thirst',
                severity: 6,
                timestamp: new Date(),
                notes: 'Drinking more water than usual',
            },
        ];
        setSymptoms(mockSymptoms);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newSymptom = {
            id: symptoms.length + 1,
            ...formData,
            timestamp: new Date(),
        };
        setSymptoms(prev => [newSymptom, ...prev]);
        setShowAddModal(false);
        resetForm();
        toast.success('Symptom logged successfully');
    };

    const resetForm = () => {
        setFormData({
            type: 'fatigue',
            severity: 5,
            notes: '',
        });
    };

    const getSymptomEmoji = (type) => {
        return symptomTypes.find(s => s.id === type)?.emoji || '📝';
    };

    const getSymptomName = (type) => {
        return symptomTypes.find(s => s.id === type)?.name || type;
    };

    const getSeverityColor = (severity) => {
        if (severity >= 8) return 'text-red-600 bg-red-100';
        if (severity >= 5) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const getRecommendation = (type, severity) => {
        if (severity >= 8) {
            return "⚠️ Please consult a healthcare provider immediately";
        }
        if (type === 'blurred_vision' || type === 'numbness') {
            return "👨‍⚕️ Schedule an appointment with your doctor soon";
        }
        if (type === 'fatigue' && severity >= 5) {
            return "😴 Ensure you're getting enough rest and stay hydrated";
        }
        return "💪 Monitor your symptoms and rest";
    };

    // Prepare chart data
    const chartData = symptoms
        .slice()
        .reverse()
        .map(s => ({
            date: s.timestamp.toLocaleDateString(),
            severity: s.severity,
            type: getSymptomName(s.type),
        }));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Symptom Checker</h2>
                    <p className="text-sm text-gray-600">Track and analyze your symptoms</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Log Symptom</span>
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Total Logged</p>
                    <p className="text-2xl font-bold text-blue-700">{symptoms.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Last 7 Days</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {symptoms.filter(s =>
                            s.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                    <p className="text-sm text-orange-600 mb-1">Most Common</p>
                    <p className="text-2xl font-bold text-orange-700">
                        {(() => {
                            const counts = symptoms.reduce((acc, s) => {
                                acc[s.type] = (acc[s.type] || 0) + 1;
                                return acc;
                            }, {});
                            const mostCommon = Object.keys(counts).reduce((a, b) =>
                                counts[a] > counts[b] ? a : b, Object.keys(counts)[0] || 'None'
                            );
                            return getSymptomName(mostCommon);
                        })()}
                    </p>
                </div>
            </div>

            {/* Severity Trend Chart */}
            {symptoms.length > 1 && (
                <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-4">Severity Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#888" />
                                <YAxis domain={[0, 10]} stroke="#888" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="severity"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Symptoms List */}
            <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Recent Symptoms</h3>
                {symptoms.map((symptom, index) => (
                    <motion.div
                        key={symptom.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-soft p-4 border border-gray-100"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">{getSymptomEmoji(symptom.type)}</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {getSymptomName(symptom.type)}
                                    </h4>
                                    <div className="flex items-center space-x-4 mt-1 text-sm">
                                        <span className="flex items-center text-gray-500">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {symptom.timestamp.toLocaleString()}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                                            Severity: {symptom.severity}/10
                                        </span>
                                    </div>
                                    {symptom.notes && (
                                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                            📝 {symptom.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSymptom(symptom)}
                                className="text-primary-600 hover:text-primary-700"
                            >
                                <DocumentTextIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {symptoms.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No symptoms logged yet</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary"
                        >
                            Log Your First Symptom
                        </button>
                    </div>
                )}
            </div>

            {/* Add Symptom Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-soft max-w-md w-full p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Log New Symptom</h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="input-label">Symptom Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    >
                                        {symptomTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.emoji} {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">
                                        Severity (1-10) <span className="text-gray-500">- {formData.severity}/10</span>
                                    </label>
                                    <input
                                        type="range"
                                        name="severity"
                                        min="1"
                                        max="10"
                                        value={formData.severity}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Mild</span>
                                        <span>Moderate</span>
                                        <span>Severe</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Notes (optional)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        rows="3"
                                        placeholder="Any additional details..."
                                    />
                                </div>

                                {/* Recommendation Preview */}
                                <div className="bg-primary-50 rounded-lg p-3">
                                    <p className="text-sm text-primary-700">
                                        {getRecommendation(formData.type, parseInt(formData.severity))}
                                    </p>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary"
                                    >
                                        Log Symptom
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Symptom Detail Modal */}
            <AnimatePresence>
                {selectedSymptom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                        onClick={() => setSelectedSymptom(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-soft max-w-md w-full p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="text-3xl">{getSymptomEmoji(selectedSymptom.type)}</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {getSymptomName(selectedSymptom.type)}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {selectedSymptom.timestamp.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-2">Severity</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary-600 rounded-full"
                                                style={{ width: `${(selectedSymptom.severity / 10) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedSymptom.severity}/10
                                        </span>
                                    </div>
                                </div>

                                {selectedSymptom.notes && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 mb-1">Notes</p>
                                        <p className="text-gray-900">{selectedSymptom.notes}</p>
                                    </div>
                                )}

                                <div className={`p-4 rounded-lg ${selectedSymptom.severity >= 8
                                        ? 'bg-red-50'
                                        : selectedSymptom.severity >= 5
                                            ? 'bg-yellow-50'
                                            : 'bg-green-50'
                                    }`}>
                                    <p className="text-sm font-medium mb-2">Recommendation</p>
                                    <p className="text-sm">
                                        {getRecommendation(selectedSymptom.type, selectedSymptom.severity)}
                                    </p>
                                </div>

                                {selectedSymptom.severity >= 8 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-2">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
                                            <p className="text-sm text-red-700">
                                                Please contact your healthcare provider immediately or visit the nearest emergency room if symptoms worsen.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => setSelectedSymptom(null)}
                                    className="w-full btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SymptomChecker;