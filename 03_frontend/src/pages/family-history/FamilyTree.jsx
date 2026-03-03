import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    UserGroupIcon,
    PlusIcon,
    UserIcon,
    HeartIcon,
    BeakerIcon,
    ClockIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useHealth } from '../../hooks/useHealth';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const FamilyTree = () => {
    const { familyHistory, getFamilyHistory, loading } = useHealth();
    const [selectedMember, setSelectedMember] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchFamilyHistory();
    }, []);

    const fetchFamilyHistory = async () => {
        await getFamilyHistory();
    };

    const getRelationshipIcon = (relationship) => {
        const icons = {
            parent: '👤',
            child: '👶',
            sibling: '👥',
            grandparent: '👴',
            aunt: '👩',
            uncle: '👨',
            cousin: '🧑',
        };
        return icons[relationship] || '👤';
    };

    const getConditionColor = (condition) => {
        const colors = {
            diabetes_t1: 'bg-blue-100 text-blue-800',
            diabetes_t2: 'bg-purple-100 text-purple-800',
            gestational: 'bg-pink-100 text-pink-800',
            heart_disease: 'bg-red-100 text-red-800',
            hypertension: 'bg-yellow-100 text-yellow-800',
            stroke: 'bg-orange-100 text-orange-800',
            obesity: 'bg-green-100 text-green-800',
            kidney_disease: 'bg-indigo-100 text-indigo-800',
        };
        return colors[condition] || 'bg-gray-100 text-gray-800';
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
            kidney_disease: 'Kidney Disease',
        };
        return labels[condition] || condition;
    };

    const filteredHistory = familyHistory.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'diabetes') {
            return ['diabetes_t1', 'diabetes_t2', 'gestational'].includes(item.condition);
        }
        return item.condition === filter;
    });

    const groupedByRelationship = filteredHistory.reduce((acc, item) => {
        if (!acc[item.relationship]) {
            acc[item.relationship] = [];
        }
        acc[item.relationship].push(item);
        return acc;
    }, {});

    const relationshipOrder = ['parent', 'child', 'sibling', 'grandparent', 'aunt', 'uncle', 'cousin'];

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Family Health History</h1>
                    <p className="text-gray-600">Track genetic risk factors and family medical history</p>
                </div>
                <Link
                    to="/family-history/add"
                    className="btn-primary flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add Family Member</span>
                </Link>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600">Family Members</p>
                            <p className="text-2xl font-bold text-blue-700">{familyHistory.length}</p>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600">Diabetes Cases</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {familyHistory.filter(h =>
                                    ['diabetes_t1', 'diabetes_t2', 'gestational'].includes(h.condition)
                                ).length}
                            </p>
                        </div>
                        <HeartIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600">Heart Disease</p>
                            <p className="text-2xl font-bold text-green-700">
                                {familyHistory.filter(h => h.condition === 'heart_disease').length}
                            </p>
                        </div>
                        <BeakerIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600">Genetic Risk Score</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {calculateGeneticRisk(familyHistory)}%
                            </p>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-soft p-2 border border-gray-100 inline-flex"
            >
                {[
                    { id: 'all', name: 'All Conditions' },
                    { id: 'diabetes', name: 'Diabetes' },
                    { id: 'heart_disease', name: 'Heart Disease' },
                    { id: 'hypertension', name: 'Hypertension' },
                    { id: 'stroke', name: 'Stroke' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.id
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </motion.div>

            {/* Family Tree Visualization */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
            >
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Family Tree</h2>

                <div className="space-y-8">
                    {relationshipOrder.map(rel => {
                        if (!groupedByRelationship[rel]?.length) return null;

                        return (
                            <div key={rel} className="space-y-3">
                                <h3 className="text-md font-medium text-gray-700 capitalize">
                                    {rel}s ({groupedByRelationship[rel].length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupedByRelationship[rel].map((member) => (
                                        <motion.div
                                            key={member.id}
                                            whileHover={{ scale: 1.02 }}
                                            className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                                            onClick={() => setSelectedMember(member)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="text-3xl">{getRelationshipIcon(member.relationship)}</div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-900 capitalize">
                                                            {member.relationship}
                                                        </span>
                                                        {member.age_at_diagnosis && (
                                                            <span className="text-xs text-gray-500">
                                                                Age {member.age_at_diagnosis}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge className={`mt-2 ${getConditionColor(member.condition)}`}>
                                                        {getConditionLabel(member.condition)}
                                                    </Badge>
                                                    {member.notes && (
                                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                                            {member.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {filteredHistory.length === 0 && (
                        <div className="text-center py-12">
                            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No family history records found</p>
                            <Link to="/family-history/add" className="btn-primary mt-4 inline-block">
                                Add Your First Family Member
                            </Link>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Genetic Risk Analysis */}
            {familyHistory.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200"
                >
                    <h2 className="text-lg font-semibold text-primary-800 mb-4">Genetic Risk Analysis</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-primary-700 mb-3">Risk Factors by Relationship</h3>
                            <div className="space-y-2">
                                {Object.entries(groupedByRelationship).map(([rel, items]) => (
                                    <div key={rel} className="flex items-center justify-between text-sm">
                                        <span className="text-primary-700 capitalize">{rel}:</span>
                                        <span className="font-medium text-primary-900">
                                            {items.length} condition{items.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-primary-700 mb-3">Most Common Conditions</h3>
                            <div className="space-y-2">
                                {Object.entries(
                                    familyHistory.reduce((acc, item) => {
                                        acc[item.condition] = (acc[item.condition] || 0) + 1;
                                        return acc;
                                    }, {})
                                )
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([condition, count]) => (
                                        <div key={condition} className="flex items-center justify-between text-sm">
                                            <span className="text-primary-700">{getConditionLabel(condition)}:</span>
                                            <span className="font-medium text-primary-900">{count}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-2">
                                <span className="text-primary-600">•</span>
                                <span>Discuss family history with your healthcare provider</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-primary-600">•</span>
                                <span>Regular screening for conditions present in family</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <span className="text-primary-600">•</span>
                                <span>Consider genetic counseling if multiple family members affected</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>
            )}

            {/* Member Detail Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl shadow-soft max-w-md w-full p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Family Member Details</h3>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="text-4xl">{getRelationshipIcon(selectedMember.relationship)}</div>
                                <div>
                                    <p className="text-xl font-semibold text-gray-900 capitalize">
                                        {selectedMember.relationship}
                                    </p>
                                    <p className="text-sm text-gray-500">Added {new Date(selectedMember.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <dl className="grid grid-cols-2 gap-4">
                                    <div>
                                        <dt className="text-sm text-gray-500">Condition</dt>
                                        <dd className="mt-1">
                                            <Badge className={getConditionColor(selectedMember.condition)}>
                                                {getConditionLabel(selectedMember.condition)}
                                            </Badge>
                                        </dd>
                                    </div>

                                    {selectedMember.age_at_diagnosis && (
                                        <div>
                                            <dt className="text-sm text-gray-500">Age at Diagnosis</dt>
                                            <dd className="mt-1 font-medium">{selectedMember.age_at_diagnosis}</dd>
                                        </div>
                                    )}
                                </dl>

                                {selectedMember.notes && (
                                    <div className="mt-4">
                                        <dt className="text-sm text-gray-500">Notes</dt>
                                        <dd className="mt-1 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                            {selectedMember.notes}
                                        </dd>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <Link
                                    to={`/family-history/edit/${selectedMember.id}`}
                                    className="flex-1 btn-primary"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => {
                                        // Handle delete
                                        setSelectedMember(null);
                                    }}
                                    className="flex-1 btn-secondary text-red-600 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Helper function to calculate genetic risk score
const calculateGeneticRisk = (history) => {
    if (!history.length) return 0;

    let score = 50; // Base risk

    const relationshipWeight = {
        parent: 0.3,
        sibling: 0.3,
        child: 0.25,
        grandparent: 0.15,
        aunt: 0.1,
        uncle: 0.1,
        cousin: 0.05,
    };

    const conditionWeight = {
        diabetes_t1: 1.2,
        diabetes_t2: 1.3,
        gestational: 1.1,
        heart_disease: 1.2,
        hypertension: 1.1,
        stroke: 1.15,
        obesity: 1.1,
        kidney_disease: 1.1,
    };

    history.forEach(item => {
        const relWeight = relationshipWeight[item.relationship] || 0.1;
        const condWeight = conditionWeight[item.condition] || 1.0;
        score += relWeight * condWeight * 10;
    });

    return Math.min(Math.round(score), 100);
};

export default FamilyTree;