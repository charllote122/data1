// src/pages/symptoms/SymptomLog.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSymptoms } from '../../hooks'; // Import from hooks barrel
import {
    PlusIcon, HeartIcon, CalendarIcon,
    ExclamationTriangleIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

const SymptomLog = () => {
    const { symptoms, loading, error, refresh, deleteSymptom } = useSymptoms();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState(null);

    useEffect(() => {
        refresh();
    }, []);

    const handleDelete = async () => {
        if (selectedSymptom) {
            await deleteSymptom(selectedSymptom.id);
            setShowDeleteModal(false);
            setSelectedSymptom(null);
        }
    };

    const getSeverityColor = (severity) => {
        if (severity >= 8) return 'text-red-600 bg-red-50';
        if (severity >= 5) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const getSeverityText = (severity) => {
        if (severity >= 8) return 'Severe';
        if (severity >= 5) return 'Moderate';
        return 'Mild';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Symptom Log</h1>
                    <p className="text-gray-600 mt-1">Track and monitor your symptoms</p>
                </div>
                <Link
                    to="/symptoms/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <PlusIcon className="w-5 h-5" />
                    Log Symptom
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {symptoms.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HeartIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No symptoms logged</h3>
                    <p className="text-gray-500 mb-6">Start tracking your symptoms</p>
                    <Link
                        to="/symptoms/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Log Symptom
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {symptoms.map((symptom) => (
                        <motion.div
                            key={symptom.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {symptom.symptom_type}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                                            {getSeverityText(symptom.severity)} ({symptom.severity}/10)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4" />
                                            {new Date(symptom.timestamp).toLocaleString()}
                                        </div>
                                    </div>

                                    {symptom.notes && (
                                        <p className="mt-3 text-gray-700">{symptom.notes}</p>
                                    )}

                                    {symptom.severity >= 8 && (
                                        <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2">
                                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">
                                                High severity symptom detected. Consider consulting a healthcare provider.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        setSelectedSymptom(symptom);
                                        setShowDeleteModal(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Symptom</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this symptom log? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedSymptom(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SymptomLog;