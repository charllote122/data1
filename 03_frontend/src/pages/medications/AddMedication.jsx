// src/pages/medications/AddMedication.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedications } from '../../hooks';
import {
    BeakerIcon,
    ClockIcon,
    CalendarIcon,
    ArrowPathIcon,
    PlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AddMedication = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addMedication, updateMedication, getMedication, loading: contextLoading } = useMedications();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'DAILY', // Uppercase to match backend
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        times: ['08:00'],
        is_active: true,
        notes: ''
    });

    // Fetch medication if editing
    useEffect(() => {
        if (id) {
            const fetchMedication = async () => {
                try {
                    console.log('📤 Fetching medication for edit:', id);
                    const medication = await getMedication(id);
                    if (medication) {
                        setFormData({
                            name: medication.name || '',
                            dosage: medication.dosage || '',
                            frequency: medication.frequency || 'DAILY',
                            start_date: medication.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
                            end_date: medication.end_date?.split('T')[0] || '',
                            times: medication.times || medication.reminder_times || medication.reminders || ['08:00'],
                            is_active: medication.is_active !== undefined ? medication.is_active : true,
                            notes: medication.notes || ''
                        });
                    }
                } catch (error) {
                    console.error('❌ Error fetching medication:', error);
                    toast.error('Failed to load medication');
                    navigate('/medications');
                } finally {
                    setFetching(false);
                }
            };
            fetchMedication();
        }
    }, [id, getMedication, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const addTime = () => {
        setFormData(prev => ({
            ...prev,
            times: [...prev.times, '12:00']
        }));
    };

    const removeTime = (index) => {
        if (formData.times.length > 1) {
            setFormData(prev => ({
                ...prev,
                times: prev.times.filter((_, i) => i !== index)
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = 'Medication name is required';
        if (!formData.dosage?.trim()) newErrors.dosage = 'Dosage is required';
        if (!formData.start_date) newErrors.start_date = 'Start date is required';

        if (formData.end_date && formData.start_date) {
            if (new Date(formData.end_date) < new Date(formData.start_date)) {
                newErrors.end_date = 'End date must be after start date';
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fill in all required fields correctly');
            return;
        }

        setLoading(true);
        try {
            const medicationData = {
                name: formData.name.trim(),
                dosage: formData.dosage.trim(),
                frequency: formData.frequency, // Now sending uppercase values
                start_date: formData.start_date,
                end_date: formData.end_date || null,
                times: formData.times.filter(time => time),
                is_active: formData.is_active,
                notes: formData.notes?.trim() || ''
            };

            console.log('📤 Submitting medication data:', medicationData);

            let result;
            if (id) {
                result = await updateMedication(id, medicationData);
                console.log('✅ Update result:', result);
                toast.success('Medication updated successfully');
            } else {
                result = await addMedication(medicationData);
                console.log('✅ Add result:', result);
                toast.success('Medication added successfully');
            }

            navigate('/medications');

        } catch (error) {
            console.error('❌ Error saving medication:', error);

            if (error.status === 400) {
                console.log('📦 Validation errors:', error.errors);
                if (error.errors) {
                    Object.keys(error.errors).forEach(field => {
                        const messages = error.errors[field];
                        const message = Array.isArray(messages) ? messages[0] : messages;
                        toast.error(`${field}: ${message}`);
                    });
                }
                if (error.errors) {
                    setErrors(error.errors);
                }
            } else {
                toast.error(error.message || `Failed to ${id ? 'update' : 'add'} medication`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching || contextLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {id ? 'Edit Medication' : 'Add Medication'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {id ? 'Update your medication details' : 'Enter your medication details'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Medication Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medication Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <BeakerIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none
                                        ${errors.name
                                            ? 'border-red-500 focus:ring-red-200'
                                            : 'border-gray-300 focus:ring-primary-200 focus:border-primary-400'
                                        }`}
                                    placeholder="e.g., Metformin"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Dosage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dosage <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none
                                    ${errors.dosage
                                        ? 'border-red-500 focus:ring-red-200'
                                        : 'border-gray-300 focus:ring-primary-200 focus:border-primary-400'
                                    }`}
                                placeholder="e.g., 500mg"
                            />
                            {errors.dosage && (
                                <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>
                            )}
                        </div>

                        {/* Frequency - Updated with uppercase values */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Frequency
                            </label>
                            <div className="relative">
                                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:outline-none"
                                >
                                    <option value="DAILY">Once daily</option>
                                    <option value="TWICE_DAILY">Twice daily</option>
                                    <option value="WEEKLY">Once weekly</option>
                                    <option value="AS_NEEDED">As needed</option>
                                </select>
                            </div>
                        </div>

                        {/* Times (Reminder Times) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reminder Times
                            </label>
                            <div className="space-y-2">
                                {formData.times.map((time, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => handleTimeChange(index, e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:outline-none"
                                        />
                                        {formData.times.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeTime(index)}
                                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addTime}
                                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    Add another reminder time
                                </button>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none
                                            ${errors.start_date
                                                ? 'border-red-500 focus:ring-red-200'
                                                : 'border-gray-300 focus:ring-primary-200 focus:border-primary-400'
                                            }`}
                                    />
                                </div>
                                {errors.start_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date (Optional)
                                </label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        min={formData.start_date}
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none
                                            ${errors.end_date
                                                ? 'border-red-500 focus:ring-red-200'
                                                : 'border-gray-300 focus:ring-primary-200 focus:border-primary-400'
                                            }`}
                                    />
                                </div>
                                {errors.end_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                )}
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-700">
                                Medication is currently active
                            </label>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 focus:outline-none"
                                placeholder="Any additional notes about this medication..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                            >
                                {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                                {loading ? 'Saving...' : (id ? 'Update Medication' : 'Add Medication')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/medications')}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};

export default AddMedication;