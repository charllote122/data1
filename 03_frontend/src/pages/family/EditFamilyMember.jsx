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
    TrashIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { RELATIONSHIP_OPTIONS, CONDITION_OPTIONS } from './constants';

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

const EditFamilyMember = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getFamilyMember, updateFamilyMember, deleteFamilyMember } = useHealth();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: yupResolver(schema)
    });

    const selectedCondition = watch('condition');

    useEffect(() => {
        loadFamilyMember();
    }, [id]);

    const loadFamilyMember = async () => {
        try {
            const result = await getFamilyMember(id);
            if (result?.success && result.data) {
                reset({
                    relationship: result.data.relationship,
                    condition: result.data.condition,
                    age_at_diagnosis: result.data.age_at_diagnosis || '',
                    notes: result.data.notes || ''
                });
            }
        } catch (error) {
            showNotification('error', 'Failed to load family member');
            navigate('/family');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const result = await updateFamilyMember(id, data);
            if (result?.success) {
                showNotification('success', 'Family member updated successfully');
                navigate('/family');
            }
        } catch (error) {
            showNotification('error', 'Failed to update family member');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const result = await deleteFamilyMember(id);
            if (result?.success) {
                showNotification('success', 'Family member deleted successfully');
                navigate('/family');
            }
        } catch (error) {
            showNotification('error', 'Failed to delete family member');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <button
                        onClick={() => navigate('/family')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Family History
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <PencilIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Family Member</h1>
                            <p className="text-gray-600 mt-1">Update family health history record</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Edit Health Record</h2>
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
                                            ${selectedCondition === option.value
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

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <HeartIcon className="w-5 h-5" />
                                        <span>Update Record</span>
                                    </>
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

                        {/* Delete Button */}
                        <div className="border-t border-gray-200 pt-6">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Delete Family Member
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this family member's health record? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default EditFamilyMember;