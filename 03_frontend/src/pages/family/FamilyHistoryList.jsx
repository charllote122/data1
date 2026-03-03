// src/pages/family/FamilyHistoryList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useHealth } from '../../hooks/useHealth';
import { useNotification } from '../../context/NotificationContext';
import {
    HeartIcon,
    UserPlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const FamilyHistoryList = () => {
    const navigate = useNavigate();
    const { familyHistory, loading, removeFamilyMember } = useHealth();
    const { showNotification } = useNotification();
    const [deleteLoading, setDeleteLoading] = useState(null);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this family member record?')) {
            setDeleteLoading(id);
            try {
                const result = await removeFamilyMember(id);
                if (result.success) {
                    showNotification('success', 'Family member removed successfully');
                } else {
                    showNotification('error', result.error || 'Failed to remove family member');
                }
            } catch (error) {
                showNotification('error', error.message || 'Failed to remove family member');
            } finally {
                setDeleteLoading(null);
            }
        }
    };

    const getConditionEmoji = (condition) => {
        const emojiMap = {
            diabetes_t1: '🩸',
            diabetes_t2: '🩸',
            gestational: '🤰',
            heart_disease: '❤️',
            hypertension: '💓',
            stroke: '🧠',
            obesity: '⚖️',
            kidney_disease: '🫀',
        };
        return emojiMap[condition] || '🏥';
    };

    const getConditionLabel = (condition) => {
        const labelMap = {
            diabetes_t1: 'Type 1 Diabetes',
            diabetes_t2: 'Type 2 Diabetes',
            gestational: 'Gestational Diabetes',
            heart_disease: 'Heart Disease',
            hypertension: 'Hypertension',
            stroke: 'Stroke',
            obesity: 'Obesity',
            kidney_disease: 'Kidney Disease',
        };
        return labelMap[condition] || condition;
    };

    const getRelationshipLabel = (relationship) => {
        const labelMap = {
            parent: 'Parent',
            child: 'Child',
            sibling: 'Sibling',
            grandparent: 'Grandparent',
            aunt: 'Aunt',
            uncle: 'Uncle',
            cousin: 'Cousin',
        };
        return labelMap[relationship] || relationship;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading family history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <HeartIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Family Health History</h1>
                                <p className="text-gray-600 mt-1">Track medical conditions in your family</p>
                            </div>
                        </div>
                        <Link
                            to="/family/add"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            <UserPlusIcon className="w-5 h-5" />
                            Add Member
                        </Link>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    {familyHistory.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HeartIcon className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No family history yet</h3>
                            <p className="text-gray-600 mb-6">
                                Start tracking your family's health history to better understand your genetic risk factors.
                            </p>
                            <Link
                                to="/family/add"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                                <UserPlusIcon className="w-5 h-5" />
                                Add First Family Member
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {familyHistory.map((member, index) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-6 hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                                                {getConditionEmoji(member.condition)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {getRelationshipLabel(member.relationship)}
                                                    </span>
                                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">
                                                        {getConditionLabel(member.condition)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    {member.age_at_diagnosis && (
                                                        <span>Diagnosed at age {member.age_at_diagnosis}</span>
                                                    )}
                                                    {member.notes && (
                                                        <span className="truncate max-w-xs">{member.notes}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/family/edit/${member.id}`}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                disabled={deleteLoading === member.id}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                            >
                                                {deleteLoading === member.id ? (
                                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
                                                ) : (
                                                    <TrashIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Info Card */}
                {familyHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                    >
                        <div className="flex items-start gap-3">
                            <InformationCircleIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-indigo-800 mb-1">Genetic Risk Assessment</h4>
                                <p className="text-sm text-indigo-700">
                                    Family history is a key factor in assessing your risk for various health conditions.
                                    Share this information with your healthcare provider for personalized recommendations.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default FamilyHistoryList;