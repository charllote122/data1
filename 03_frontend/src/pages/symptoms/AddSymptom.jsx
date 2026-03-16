// src/pages/symptoms/AddSymptom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSymptoms } from '../../context/SymptomsContext';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import aiService from '../../services/aiService';
import {
    HeartIcon,
    CalendarIcon,
    ClockIcon,
    PencilIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AddSymptom = () => {
    const navigate = useNavigate();
    const { logSymptom, refresh, symptoms } = useSymptoms();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState(null);
    const [formData, setFormData] = useState({
        symptom_type: '',
        severity: 5,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        duration: '',
        notes: ''
    });

    // Symptom types
    const symptomTypes = [
        { value: 'headache', label: 'Headache', emoji: '🤕' },
        { value: 'fatigue', label: 'Fatigue', emoji: '😴' },
        { value: 'thirst', label: 'Excessive Thirst', emoji: '🥤' },
        { value: 'urination', label: 'Frequent Urination', emoji: '🚽' },
        { value: 'blurred_vision', label: 'Blurred Vision', emoji: '👓' },
        { value: 'nausea', label: 'Nausea', emoji: '🤢' },
        { value: 'dizziness', label: 'Dizziness', emoji: '😵' },
        { value: 'weakness', label: 'Weakness', emoji: '😓' },
        { value: 'numbness', label: 'Numbness', emoji: '🦶' },
        { value: 'chest_pain', label: 'Chest Pain', emoji: '💔' },
        { value: 'shortness_breath', label: 'Shortness of Breath', emoji: '🫁' },
        { value: 'high_blood_sugar', label: 'High Blood Sugar', emoji: '📈' },
        { value: 'low_blood_sugar', label: 'Low Blood Sugar', emoji: '📉' },
        { value: 'other', label: 'Other', emoji: '🔍' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ============================================
    // FIXED: Handle symptom submission with debugging
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('🔍 ===== FORM SUBMISSION STARTED =====');
        console.log('1. Form data:', formData);

        // Validation
        if (!formData.symptom_type) {
            console.log('❌ Validation failed: No symptom type');
            toast.error('Please select a symptom type');
            return;
        }

        setLoading(true);
        setDebug({ status: 'submitting', data: formData });
        
        try {
            // Find selected symptom
            const selectedSymptom = symptomTypes.find(s => s.value === formData.symptom_type);
            console.log('2. Selected symptom:', selectedSymptom);

            // Create timestamp
            let timestamp;
            if (formData.date && formData.time) {
                timestamp = `${formData.date}T${formData.time}:00`;
            } else if (formData.date) {
                timestamp = `${formData.date}T00:00:00`;
            } else {
                timestamp = new Date().toISOString();
            }
            console.log('3. Timestamp:', timestamp);

            // Prepare symptom data
            const symptomData = {
                id: Date.now().toString(),
                symptom_type: formData.symptom_type,
                symptom_label: selectedSymptom?.label || formData.symptom_type,
                severity: parseInt(formData.severity),
                timestamp: new Date(timestamp).toISOString(),
                duration: formData.duration || null,
                notes: formData.notes || '',
                emoji: selectedSymptom?.emoji || '🔍',
                created_at: new Date().toISOString()
            };
            console.log('4. Prepared symptom data:', symptomData);
            setDebug({ status: 'prepared', data: symptomData });

            // Try to log symptom
            console.log('5. Calling logSymptom function...');
            console.log('logSymptom type:', typeof logSymptom);
            
            let result;
            if (logSymptom) {
                try {
                    result = await logSymptom(symptomData);
                    console.log('6. logSymptom result:', result);
                } catch (logError) {
                    console.error('❌ logSymptom error:', logError);
                    result = { error: logError.message };
                }
            } else {
                console.warn('⚠️ logSymptom function is undefined!');
                result = { error: 'logSymptom not available' };
            }

            // If API fails, use local storage fallback
            if (!result || result.error) {
                console.log('7. Using localStorage fallback...');
                
                // Get existing symptoms from localStorage
                const existingSymptoms = JSON.parse(localStorage.getItem('localSymptoms') || '[]');
                
                // Add new symptom
                const newSymptom = {
                    ...symptomData,
                    id: Date.now().toString(),
                    local: true
                };
                
                existingSymptoms.push(newSymptom);
                localStorage.setItem('localSymptoms', JSON.stringify(existingSymptoms));
                
                console.log('8. Saved to localStorage. Total:', existingSymptoms.length);
                console.log('9. New symptom:', newSymptom);
                
                setDebug({ status: 'localStorage', data: newSymptom });
                result = { success: true, local: true };
            }

            // Show success message
            console.log('10. Success! Showing toast...');
            toast.success('✅ Symptom logged successfully!', {
                duration: 3000,
                icon: '✅'
            });

            // Refresh symptoms list
            console.log('11. Refreshing symptoms list...');
            if (refresh) {
                try {
                    await refresh();
                    console.log('12. Refresh completed');
                } catch (refreshError) {
                    console.error('Refresh error:', refreshError);
                }
            }

            // Navigate back
            console.log('13. Navigating back in 500ms...');
            setTimeout(() => {
                console.log('14. Navigating to symptoms list');
                navigate(ROUTES.SYMPTOMS.LIST);
            }, 500);

        } catch (error) {
            console.error('❌ CRITICAL ERROR:', error);
            console.error('Error stack:', error.stack);
            
            setDebug({ status: 'error', error: error.message, stack: error.stack });
            toast.error(error.message || 'Failed to log symptom');
        } finally {
            console.log('15. Form submission completed');
            setLoading(false);
        }
    };

    // Get AI suggestion
    const getAISuggestion = async () => {
        if (!formData.symptom_type) {
            toast.error('Please select a symptom type first');
            return;
        }

        try {
            toast.loading('Getting AI insights...', { id: 'ai' });
            
            const selectedSymptom = symptomTypes.find(s => s.value === formData.symptom_type);
            
            const response = await aiService.analyzeSymptoms(
                [selectedSymptom?.label || formData.symptom_type],
                formData.duration || 'unknown'
            );

            if (response && response.analysis) {
                toast.success('AI insights ready!', { id: 'ai' });
                // Show in a modal or panel
                alert('AI Insights:\n\n' + response.analysis);
            }
        } catch (error) {
            console.error('AI error:', error);
            toast.error('Could not get AI insights', { id: 'ai' });
        }
    };

    const getSeverityColor = (severity) => {
        if (severity >= 8) return 'text-red-600 bg-red-100';
        if (severity >= 5) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
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
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                    <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                        <HeartIcon className="w-5 h-5" />
                        Log New Symptom
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Debug Info (only visible in development) */}
                    {process.env.NODE_ENV === 'development' && debug && (
                        <div className="p-3 bg-gray-100 rounded-lg text-xs font-mono">
                            <p className="font-bold mb-1">Debug:</p>
                            <pre>{JSON.stringify(debug, null, 2)}</pre>
                        </div>
                    )}

                    {/* Emergency Warning */}
                    {(formData.symptom_type === 'chest_pain' || formData.symptom_type === 'shortness_breath') && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                If you're experiencing severe symptoms, seek immediate medical attention.
                            </p>
                        </div>
                    )}

                    {/* Symptom Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Symptom Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {symptomTypes.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, symptom_type: type.value }))}
                                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                                        formData.symptom_type === type.value
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-2xl block mb-1">{type.emoji}</span>
                                    <span className="text-xs font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Severity: {formData.severity}/10
                        </label>
                        <input
                            type="range"
                            name="severity"
                            min="1"
                            max="10"
                            value={formData.severity}
                            onChange={handleChange}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-green-600">Mild (1-4)</span>
                            <span className="text-yellow-600">Moderate (5-7)</span>
                            <span className="text-red-600">Severe (8-10)</span>
                        </div>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <CalendarIcon className="w-4 h-4 inline mr-1" />
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                Time
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <ClockIcon className="w-4 h-4 inline mr-1" />
                            Duration
                        </label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        >
                            <option value="">How long?</option>
                            <option value="just_started">Just started (hours)</option>
                            <option value="one_day">1 day</option>
                            <option value="few_days">2-3 days</option>
                            <option value="one_week">About a week</option>
                            <option value="weeks">More than a week</option>
                            <option value="chronic">Chronic/Ongoing</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <PencilIcon className="w-4 h-4 inline mr-1" />
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any additional details..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading || !formData.symptom_type}
                            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-5 h-5" />
                                    LOG Symptom
                                </>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={getAISuggestion}
                            disabled={!formData.symptom_type}
                            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            AI
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.SYMPTOMS.LIST)}
                            className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Test localStorage button */}
                    {process.env.NODE_ENV === 'development' && (
                        <button
                            type="button"
                            onClick={() => {
                                const stored = localStorage.getItem('localSymptoms');
                                alert('LocalStorage symptoms:\n' + (stored || 'None'));
                            }}
                            className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600"
                        >
                            Check localStorage
                        </button>
                    )}
                </form>
            </motion.div>

            {/* Quick Tips */}
            <Card className="mt-6 bg-blue-50">
                <div className="flex items-start gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Tips</h4>
                        <p className="text-xs text-blue-700">
                            Log symptoms as soon as possible for accurate tracking. 
                            Include what you were doing when symptoms started.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AddSymptom;