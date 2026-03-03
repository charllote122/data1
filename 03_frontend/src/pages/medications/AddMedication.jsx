// src/pages/medications/AddMedication.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedications } from '../../hooks'; // Import from hooks barrel
import {
    BeakerIcon, ClockIcon, CalendarIcon,
    ArrowPathIcon, CheckCircleIcon
} from '@heroicons/react/24/outline';

const AddMedication = () => {
    const navigate = useNavigate();
    const { addMedication } = useMedications();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'daily',
        start_date: '',
        end_date: '',
        reminders: [],
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Medication name is required';
        if (!formData.dosage) newErrors.dosage = 'Dosage is required';
        if (!formData.start_date) newErrors.start_date = 'Start date is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await addMedication(formData);
            navigate('/medications');
        } catch (error) {
            setErrors({ general: error.message || 'Failed to add medication' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-6">
                    <h2 className="text-3xl font-bold text-white">Add Medication</h2>
                    <p className="text-primary-100 mt-2">Enter your medication details</p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
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
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 
                                    ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'}`}
                                placeholder="e.g., Metformin"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dosage <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="dosage"
                            value={formData.dosage}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 
                                ${errors.dosage ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'}`}
                            placeholder="e.g., 500mg"
                        />
                        {errors.dosage && (
                            <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>
                        )}
                    </div>

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
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                            >
                                <option value="daily">Once daily</option>
                                <option value="twice_daily">Twice daily</option>
                                <option value="three_times">Three times daily</option>
                                <option value="four_times">Four times daily</option>
                                <option value="weekly">Once weekly</option>
                                <option value="monthly">Once monthly</option>
                                <option value="as_needed">As needed</option>
                            </select>
                        </div>
                    </div>

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
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 
                                        ${errors.start_date ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary-200'}`}
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
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                            placeholder="Any additional notes..."
                        />
                    </div>

                    {errors.general && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                            {errors.general}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                            {loading ? 'Adding...' : 'Add Medication'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/medications')}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddMedication;