// src/pages/family/EditFamilyMember.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useHealth } from '../../hooks/useHealth';
import { useNotification } from '../../context/NotificationContext';
import {
    PencilIcon,
    ArrowLeftIcon,
    HeartIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

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
    { value: 'diabetes_t1', label: 'Type 1 Diabetes', emoji: '🩸' },
    { value: 'diabetes_t2', label: 'Type 2 Diabetes', emoji: '🩸' },
    { value: 'gestational', label: 'Gestational Diabetes', emoji: '🤰' },
    { value: 'heart_disease', label: 'Heart Disease', emoji: '❤️' },
    { value: 'hypertension', label: 'Hypertension', emoji: '💓' },
    { value: 'stroke', label: 'Stroke', emoji: '🧠' },
    { value: 'obesity', label: 'Obesity', emoji: '⚖️' },
    { value: 'kidney_disease', label: 'Kidney Disease', emoji: '🫀' },
];

const EditFamilyMember = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { familyHistory, updateFamilyMember, removeFamilyMember } = useHealth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            relationship: '',
            condition: '',
            age_at_diagnosis: '',
            notes: '',
        },
    });

    useEffect(() => {
        const member = familyHistory.find(m => m.id === parseInt(id));
        if (member) {
            reset({
                relationship: member.relationship,
                condition: member.condition,
                age_at_diagnosis: member.age_at_diagnosis || '',
                notes: member.notes || '',
            });
        } else {
            showNotification('error', 'Family member not found');
            navigate('/family');
        }
    }, [id, familyHistory, reset, navigate, showNotification]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const result = await updateFamilyMember(id, data);
            if (result.success) {
                showNotification('success', 'Family member updated successfully');
                navigate('/family');
            } else {
                showNotification('error', result.error || 'Failed to update family member');
            }
        } catch (error) {
            showNotification('error', error.message || 'Failed to update family member');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this family member?')) {
            setDeleteLoading(true);
            try {
                const result = await removeFamilyMember(id);
                if (result.success) {
                    showNotification('success', 'Family member removed successfully');
                    navigate('/family');
                } else {
                    showNotification('error', result.error || 'Failed to remove family member');
                }
            } catch (error) {
                showNotification('error', error.message || 'Failed to remove family member');
            } finally {
                setDeleteLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/family')}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Family History
                </button>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                                <PencilIcon className="w-5 h-5" />
                                Edit Family Member
                            </h1>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleteLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <TrashIcon className="w-4 h-4" />
                                )}
                                Delete
                            </button>
                        </div>
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
                                <p className="mt-1 text-sm text-red-600">{errors.relationship.message}</p>
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
                                            ${watch('condition') === option.value
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            {...register('condition')}
                                            value={option.value}
                                            className="sr-only"
                                        />
                                        <span className="text-2xl">{option.emoji}</span>
                                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.condition && (
                                <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                            )}
                        </div>

                        {/* Age at Diagnosis */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Age at Diagnosis <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="number"
                                {...register('age_at_diagnosis')}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition
                                    ${errors.age_at_diagnosis ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                placeholder="Enter age at diagnosis"
                                min="0"
                                max="120"
                            />
                            {errors.age_at_diagnosis && (
                                <p className="mt-1 text-sm text-red-600">{errors.age_at_diagnosis.message}</p>
                            )}
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
                                placeholder="Any additional information..."
                            />
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/family')}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditFamilyMember;