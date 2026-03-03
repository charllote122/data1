import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BeakerIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CalendarIcon,
    BellIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MedicationTracker = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMedication, setEditingMedication] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'daily',
        times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
        reminders: true,
    });

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            setLoading(true);
            // Mock data for now - replace with actual API call
            const mockMedications = [
                {
                    id: 1,
                    name: 'Metformin',
                    dosage: '500mg',
                    frequency: 'twice_daily',
                    times: ['08:00', '20:00'],
                    startDate: '2024-01-01',
                    endDate: null,
                    notes: 'Take with meals',
                    reminders: true,
                    taken: ['08:00', '20:00'],
                },
                {
                    id: 2,
                    name: 'Lisinopril',
                    dosage: '10mg',
                    frequency: 'daily',
                    times: ['09:00'],
                    startDate: '2024-01-15',
                    endDate: null,
                    notes: 'Blood pressure medication',
                    reminders: true,
                    taken: ['09:00'],
                },
                {
                    id: 3,
                    name: 'Aspirin',
                    dosage: '81mg',
                    frequency: 'daily',
                    times: ['08:00'],
                    startDate: '2024-02-01',
                    endDate: '2024-03-01',
                    notes: 'Low dose aspirin',
                    reminders: false,
                    taken: [],
                },
            ];
            setMedications(mockMedications);
        } catch (error) {
            toast.error('Failed to load medications');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const addTime = () => {
        setFormData(prev => ({
            ...prev,
            times: [...prev.times, '12:00'],
        }));
    };

    const removeTime = (index) => {
        setFormData(prev => ({
            ...prev,
            times: prev.times.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMedication) {
                // Update existing medication
                setMedications(prev =>
                    prev.map(med =>
                        med.id === editingMedication.id
                            ? { ...med, ...formData }
                            : med
                    )
                );
                toast.success('Medication updated successfully');
            } else {
                // Add new medication
                const newMedication = {
                    id: medications.length + 1,
                    ...formData,
                    taken: [],
                };
                setMedications(prev => [...prev, newMedication]);
                toast.success('Medication added successfully');
            }
            setShowAddModal(false);
            setEditingMedication(null);
            resetForm();
        } catch (error) {
            toast.error('Failed to save medication');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medication?')) {
            try {
                setMedications(prev => prev.filter(med => med.id !== id));
                toast.success('Medication deleted successfully');
            } catch (error) {
                toast.error('Failed to delete medication');
            }
        }
    };

    const handleTakeMedication = (medicationId, time) => {
        setMedications(prev =>
            prev.map(med =>
                med.id === medicationId
                    ? { ...med, taken: [...med.taken, time] }
                    : med
            )
        );
        toast.success('Medication taken!');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            dosage: '',
            frequency: 'daily',
            times: ['08:00'],
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            notes: '',
            reminders: true,
        });
    };

    const getFrequencyLabel = (frequency) => {
        const labels = {
            daily: 'Once daily',
            twice_daily: 'Twice daily',
            three_times: 'Three times daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            as_needed: 'As needed',
        };
        return labels[frequency] || frequency;
    };

    const isMedicationActive = (medication) => {
        const today = new Date();
        const startDate = new Date(medication.startDate);
        const endDate = medication.endDate ? new Date(medication.endDate) : null;

        return startDate <= today && (!endDate || endDate >= today);
    };

    const getTodayTakenCount = (medication) => {
        const today = new Date().toDateString();
        return medication.taken.filter(time => {
            const takenDate = new Date().toDateString(); // Simplified - in real app, store timestamp
            return true;
        }).length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Medication Tracker</h2>
                    <p className="text-sm text-gray-600">Manage and track your medications</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMedication(null);
                        resetForm();
                        setShowAddModal(true);
                    }}
                    className="btn-primary flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Medication</span>
                </button>
            </div>

            {/* Today's Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4">
                <h3 className="font-medium text-primary-800 mb-2">Today's Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-primary-600">Active Medications</p>
                        <p className="text-2xl font-bold text-primary-700">
                            {medications.filter(isMedicationActive).length}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-primary-600">Taken Today</p>
                        <p className="text-2xl font-bold text-primary-700">
                            {medications.reduce((sum, med) => sum + getTodayTakenCount(med), 0)} doses
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-primary-600">Next Reminder</p>
                        <p className="text-2xl font-bold text-primary-700">20:00</p>
                    </div>
                </div>
            </div>

            {/* Medications List */}
            <div className="space-y-4">
                {medications.map((medication, index) => (
                    <motion.div
                        key={medication.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-xl shadow-soft p-4 border ${isMedicationActive(medication)
                                ? 'border-green-200'
                                : 'border-gray-200 opacity-60'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${isMedicationActive(medication)
                                        ? 'bg-green-100'
                                        : 'bg-gray-100'
                                    }`}>
                                    <BeakerIcon className={`w-5 h-5 ${isMedicationActive(medication)
                                            ? 'text-green-600'
                                            : 'text-gray-600'
                                        }`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                                    <p className="text-sm text-gray-600">{medication.dosage}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-sm">
                                        <span className="flex items-center text-gray-500">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {getFrequencyLabel(medication.frequency)}
                                        </span>
                                        <span className="flex items-center text-gray-500">
                                            <CalendarIcon className="w-4 h-4 mr-1" />
                                            Started: {new Date(medication.startDate).toLocaleDateString()}
                                        </span>
                                        {medication.reminders && (
                                            <span className="flex items-center text-primary-600">
                                                <BellIcon className="w-4 h-4 mr-1" />
                                                Reminders on
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => {
                                        setEditingMedication(medication);
                                        setFormData(medication);
                                        setShowAddModal(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(medication.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Times */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                            {medication.times.map((time, i) => {
                                const taken = medication.taken.includes(time);
                                return (
                                    <button
                                        key={i}
                                        onClick={() => !taken && handleTakeMedication(medication.id, time)}
                                        disabled={taken || !isMedicationActive(medication)}
                                        className={`flex items-center justify-between p-2 rounded-lg border ${taken
                                                ? 'bg-green-50 border-green-200 cursor-default'
                                                : 'hover:bg-gray-50 border-gray-200'
                                            } ${!isMedicationActive(medication) ? 'opacity-50' : ''}`}
                                    >
                                        <span className="text-sm font-medium">{time}</span>
                                        {taken ? (
                                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="w-5 h-5 text-gray-300" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {medication.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                                {medication.notes}
                            </div>
                        )}
                    </motion.div>
                ))}

                {medications.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <BeakerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No medications added yet</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary"
                        >
                            Add Your First Medication
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="input-label">Medication Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Dosage</label>
                                    <input
                                        type="text"
                                        name="dosage"
                                        value={formData.dosage}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="e.g., 500mg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Frequency</label>
                                    <select
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleInputChange}
                                        className="input-field"
                                    >
                                        <option value="daily">Once daily</option>
                                        <option value="twice_daily">Twice daily</option>
                                        <option value="three_times">Three times daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="as_needed">As needed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">Times</label>
                                    <div className="space-y-2">
                                        {formData.times.map((time, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="time"
                                                    value={time}
                                                    onChange={(e) => handleTimeChange(index, e.target.value)}
                                                    className="input-field flex-1"
                                                />
                                                {formData.times.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTime(index)}
                                                        className="p-2 text-gray-400 hover:text-red-600"
                                                    >
                                                        <XCircleIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addTime}
                                            className="text-sm text-primary-600 hover:text-primary-700"
                                        >
                                            + Add another time
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="input-label">Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">End Date (optional)</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        rows="2"
                                        placeholder="Special instructions..."
                                    />
                                </div>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="reminders"
                                        checked={formData.reminders}
                                        onChange={handleInputChange}
                                        className="rounded text-primary-600"
                                    />
                                    <span className="text-sm text-gray-700">Enable reminders</span>
                                </label>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary"
                                    >
                                        {editingMedication ? 'Update' : 'Add'} Medication
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
        </div>
    );
};

export default MedicationTracker;