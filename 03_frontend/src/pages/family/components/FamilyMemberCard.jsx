import React from 'react';
import { motion } from 'framer-motion';
import {
    PencilIcon,
    TrashIcon,
    ClockIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

const FamilyMemberCard = ({ member, index, onEdit, onDelete }) => {
    const getRelationshipIcon = (relationship) => {
        const icons = {
            parent: '👪',
            child: '👶',
            sibling: '🤝',
            grandparent: '👴',
            aunt: '👩',
            uncle: '👨',
            cousin: '👥'
        };
        return icons[relationship] || '👤';
    };

    const getConditionEmoji = (condition) => {
        const emojis = {
            diabetes_t1: '🩸',
            diabetes_t2: '🩸',
            gestational: '🤰',
            heart_disease: '❤️',
            hypertension: '💓',
            stroke: '🧠',
            obesity: '⚖️',
            kidney_disease: '🫀'
        };
        return emojis[condition] || '🏥';
    };

    const getConditionLabel = (condition) => {
        const labels = {
            diabetes_t1: 'Type 1 Diabetes',
            diabetes_t2: 'Type 2 Diabetes',
            gestational: 'Gestational Diabetes',
            heart_disease: 'Heart Disease',
            hypertension: 'Hypertension',
            stroke: 'Stroke',
            obesity: 'Obesity',
            kidney_disease: 'Kidney Disease'
        };
        return labels[condition] || condition;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-105"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                            {getRelationshipIcon(member.relationship)}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                {member.relationship}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Added {new Date(member.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-start gap-2">
                        <span className="text-2xl">{getConditionEmoji(member.condition)}</span>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {getConditionLabel(member.condition)}
                            </p>
                            {member.age_at_diagnosis && (
                                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                    <ClockIcon className="w-3 h-3" />
                                    Diagnosed at age {member.age_at_diagnosis}
                                </p>
                            )}
                        </div>
                    </div>

                    {member.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {member.notes}
                        </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <HeartIcon className="w-4 h-4 text-pink-500" />
                        <span className="text-xs text-gray-500">
                            Genetic data included in risk assessment
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FamilyMemberCard;