// src/pages/family/AddFamilyMember.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useHealth } from '../../hooks/useHealth';
import { useNotification } from '../../context/NotificationContext';
import {
    UserPlusIcon,
    ArrowLeftIcon,
    HeartIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    ClockIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { ROUTES } from '../../constants/routes';

const schema = yup.object({
    relationship: yup.string().required('Relationship is required'),
    condition: yup.string().required('Condition is required'),
    age_at_diagnosis: yup.number()
        .nullable()
        .transform((value, originalValue) => originalValue === '' ? null : value)
        .min(0, 'Age must be positive')
        .max(120, 'Age must be less than 120'),
    notes: yup.string().max(500, 'Notes must be less than 500 characters'),
});

const RELATIONSHIP_OPTIONS = [
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'aunt', label: 'Aunt' },
    { value: 'uncle', label: 'Uncle' },
    { value: 'cousin', label: 'Cousin' },
];

const CONDITION_OPTIONS = [
    { value: 'diabetes_t1', label: 'Type 1 Diabetes', emoji: '🩸', risk: 'high' },
    { value: 'diabetes_t2', label: 'Type 2 Diabetes', emoji: '🩸', risk: 'high' },
    { value: 'gestational', label: 'Gestational Diabetes', emoji: '🤰', risk: 'moderate' },
    { value: 'heart_disease', label: 'Heart Disease', emoji: '❤️', risk: 'high' },
    { value: 'hypertension', label: 'Hypertension', emoji: '💓', risk: 'moderate' },
    { value: 'stroke', label: 'Stroke', emoji: '🧠', risk: 'high' },
    { value: 'obesity', label: 'Obesity', emoji: '⚖️', risk: 'moderate' },
    { value: 'kidney_disease', label: 'Kidney Disease', emoji: '🫀', risk: 'high' },
];

const AddFamilyMember = () => {
    const navigate = useNavigate();
    const { addFamilyHistory } = useHealth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            relationship: '',
            condition: '',
            age_at_diagnosis: '',
            notes: '',
        },
    });

    const selectedRelationship = watch('relationship');
    const selectedCondition = watch('condition');
    const ageAtDiagnosis = watch('age_at_diagnosis');

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            const result = await addFamilyHistory(data);

            if (result.success) {
                showNotification('success', 'Family member added successfully');
                navigate('/family-history');
            } else {
                showNotification('error', result.error || 'Failed to add family member');
            }
        } catch (error) {
            console.error('Error adding family member:', error);
            showNotification('error', error.message || 'Failed to add family member');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (selectedRelationship || selectedCondition || ageAtDiagnosis) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate('/family-history');
            }
        } else {
            navigate('/family-history');
        }
    };

    const getRiskLevelColor = (risk) => {
        switch (risk) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSelectedConditionDetails = () => {
        return CONDITION_OPTIONS.find(c => c.value === selectedCondition);
    };

    const getRelationshipLabel = () => {
        return RELATIONSHIP_OPTIONS.find(r => r.value === selectedRelationship)?.label;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Family History
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <UserPlusIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add Family Member</h1>
                            <p className="text-gray-600 mt-1">Record medical history of family members</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Family Health History</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                        {/* Relationship */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relationship <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('relationship')}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition
                                    ${errors.relationship ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                            >
                                <option value="">Select relationship</option>
                                {RELATIONSHIP_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.relationship && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <XMarkIcon className="w-4 h-4" />
                                    {errors.relationship.message}
                                </p>
                            )}
                        </div>

                        {/* Condition */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medical Condition <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {CONDITION_OPTIONS.map(option => (
                                    <label
                                        key={option.value}
                                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                                            ${selectedCondition === option.value
                                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            {...register('condition')}
                                            value={option.value}
                                            className="sr-only"
                                        />
                                        <span className="text-2xl">{option.emoji}</span>
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-900">{option.label}</span>
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRiskLevelColor(option.risk)}`}>
                                                {option.risk} risk
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.condition && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <XMarkIcon className="w-4 h-4" />
                                    {errors.condition.message}
                                </p>
                            )}
                        </div>

                        {/* Age at Diagnosis */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age at Diagnosis <span className="text-gray-400">(optional)</span>
                            </label>
                            <div className="relative">
                                <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    {...register('age_at_diagnosis')}
                                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                        ${errors.age_at_diagnosis ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                    placeholder="Enter age at diagnosis"
                                    min="0"
                                    max="120"
                                />
                            </div>
                            {errors.age_at_diagnosis && (
                                <p className="mt-1 text-sm text-red-600">{errors.age_at_diagnosis.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Leave blank if unknown or not applicable
                            </p>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes <span className="text-gray-400">(optional)</span>
                            </label>
                            <textarea
                                {...register('notes')}
                                rows="4"
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition
                                    ${errors.notes ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                placeholder="Any additional information about this family member's health history..."
                            />
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                            )}
                        </div>

                        {/* Genetic Risk Preview */}
                        {selectedCondition && selectedRelationship && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <HeartIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-indigo-800 mb-1">Genetic Risk Assessment</h4>
                                        <p className="text-sm text-indigo-700">
                                            Adding a <span className="font-semibold">{getRelationshipLabel()}</span> with{' '}
                                            <span className="font-semibold">{getSelectedConditionDetails()?.label}</span>{' '}
                                            may affect your genetic risk profile.
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 bg-white rounded-full text-indigo-700 border border-indigo-200">
                                                Risk level: {getSelectedConditionDetails()?.risk}
                                            </span>
                                            <span className="text-xs text-indigo-600">
                                                Discuss with healthcare provider
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlusIcon className="w-5 h-5" />
                                        <span>Add Family Member</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Information Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                >
                    <div className="flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 mb-2">Why track family history?</h3>
                            <ul className="space-y-2 text-sm text-blue-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Many health conditions have genetic components</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Family history helps identify potential risk factors</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Early awareness enables preventive measures</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Healthcare providers use this information for screening recommendations</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Privacy Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs text-gray-500">
                        <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                        <span>Your family health data is encrypted and private</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AddFamilyMember;