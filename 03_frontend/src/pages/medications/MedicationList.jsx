// src/pages/medications/MedicationList.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedications } from '../../hooks'; // Import from hooks barrel
import {
    PlusIcon, PencilIcon, TrashIcon,
    ClockIcon, CheckCircleIcon, XCircleIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const MedicationList = () => {
    const { medications, loading, error, refresh, deleteMedication } = useMedications();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [filter, setFilter] = useState('all'); // all, active, inactive

    useEffect(() => {
        refresh();
    }, []);

    const handleDelete = async () => {
        if (selectedMedication) {
            await deleteMedication(selectedMedication.id);
            setShowDeleteModal(false);
            setSelectedMedication(null);
        }
    };

    const filteredMedications = medications.filter(med => {
        if (filter === 'active') return med.is_active;
        if (filter === 'inactive') return !med.is_active;
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
                    <p className="text-gray-600 mt-1">Track and manage your medications</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        to="/medications/calendar"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        <CalendarIcon className="w-5 h-5" />
                        Calendar
                    </Link>
                    <Link
                        to="/medications/new"
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Medication
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2">
                {['all', 'active', 'inactive'].map((filterOption) => (
                    <button
                        key={filterOption}
                        onClick={() => setFilter(filterOption)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors
                            ${filter === filterOption
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {filterOption}
                    </button>
                ))}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {filteredMedications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ClockIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No medications found</h3>
                    <p className="text-gray-500 mb-6">
                        {filter === 'all'
                            ? 'Start by adding your first medication'
                            : `No ${filter} medications found`
                        }
                    </p>
                    {filter === 'all' && (
                        <Link
                            to="/medications/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Medication
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMedications.map((medication) => (
                        <motion.div
                            key={medication.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                                    <p className="text-sm text-gray-600">{medication.dosage}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/medications/${medication.id}/edit`}
                                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setSelectedMedication(medication);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <ClockIcon className="w-4 h-4" />
                                    <span>Frequency: {medication.frequency}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {medication.is_active ? (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            <CheckCircleIcon className="w-3 h-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                                            <XCircleIcon className="w-3 h-3" />
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500">
                                    <p>Started: {new Date(medication.start_date).toLocaleDateString()}</p>
                                    {medication.end_date && (
                                        <p>Ends: {new Date(medication.end_date).toLocaleDateString()}</p>
                                    )}
                                </div>
                            </div>

                            {medication.notes && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-600">{medication.notes}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl max-w-md w-full p-6"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Medication</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{selectedMedication?.name}</span>?
                            This action cannot be undone.
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
                                    setSelectedMedication(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MedicationList;