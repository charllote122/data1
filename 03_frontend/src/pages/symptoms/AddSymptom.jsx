// src/pages/symptoms/AddSymptom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSymptoms } from '../../context/SymptomsContext';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import {
    HeartIcon,
    CalendarIcon,
    ClockIcon,
    PencilIcon,
    XMarkIcon,
    ArrowLeftIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const AddSymptom = () => {
    const navigate = useNavigate();
    const { logSymptom } = useSymptoms();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        symptom_type: '',
        severity: 5,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        notes: ''
    });

    const symptomTypes = [
        { value: 'FATIGUE', label: 'Fatigue' },
        { value: 'THIRST', label: 'Excessive Thirst' },
        { value: 'URINATION', label: 'Frequent Urination' },
        { value: 'BLURRY_VISION', label: 'Blurry Vision' },
        { value: 'HEADACHE', label: 'Headache' },
        { value: 'NAUSEA', label: 'Nausea' },
        { value: 'DIZZINESS', label: 'Dizziness' },
        { value: 'WEAKNESS', label: 'Weakness' },
        { value: 'NUMBNESS', label: 'Numbness' },
        { value: 'OTHER', label: 'Other' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.symptom_type) {
            showNotification('error', 'Please select a symptom type');
            return;
        }

        setLoading(true);

        try {
            // Ensure data is properly formatted
            const symptomData = {
                symptom_type: formData.symptom_type,
                severity: parseInt(formData.severity),
                date: formData.date,
                time: formData.time || null,
                notes: formData.notes || ''
            };

            console.log('📤 Submitting symptom:', symptomData);
            await logSymptom(symptomData);

            showNotification('success', 'Symptom logged successfully!');
            navigate(ROUTES.SYMPTOMS.LIST);
        } catch (error) {
            console.error('Error logging symptom:', error);
            showNotification('error', error.message || 'Failed to log symptom');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
            </button>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                        <HeartIcon className="w-5 h-5" />
                        Log New Symptom
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Symptom Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Symptom Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="symptom_type"
                            value={formData.symptom_type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            required
                        >
                            <option value="">Select a symptom</option>
                            {symptomTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Severity Slider */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Severity (1-10)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                name="severity"
                                min="1"
                                max="10"
                                value={formData.severity}
                                onChange={handleChange}
                                className="flex-1"
                            />
                            <span className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-lg font-semibold text-indigo-700">
                                {formData.severity}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Mild</span>
                            <span>Moderate</span>
                            <span>Severe</span>
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <CalendarIcon className="w-4 h-4 inline mr-1" />
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                Time
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <PencilIcon className="w-4 h-4 inline mr-1" />
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Add any additional details about your symptom..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : 'Log Symptom'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.SYMPTOMS.LIST)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddSymptom;