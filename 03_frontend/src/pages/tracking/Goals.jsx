import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FlagIcon,
    PlusIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    PencilIcon,
    TrashIcon,
    TrophyIcon,
} from '@heroicons/react/24/outline';
import { useHealth } from '../../hooks/useHealth';
import Loader from '../../components/Loader';
import ProgressBar from '../../components/ProgressBar';
import Badge from '../../components/Badge';
import ConfirmationModal from '../../components/ConfirmationModal';
import { formatDistanceToNow } from 'date-fns';

const Goals = () => {
    const { goals, getGoals, updateGoal, deleteGoal, loading } = useHealth();
    const [filter, setFilter] = useState('active');
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressValue, setProgressValue] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        await getGoals();
    };

    const filteredGoals = goals.filter(goal => {
        if (filter === 'active') return goal.status === 'active';
        if (filter === 'completed') return goal.status === 'completed';
        if (filter === 'abandoned') return goal.status === 'abandoned';
        return true;
    });

    const getGoalIcon = (type) => {
        const icons = {
            weight_loss: '⚖️',
            weight_gain: '⬆️',
            exercise: '🏃',
            bmi_reduction: '📊',
            risk_reduction: '🩺',
            quit_smoking: '🚭',
            diet: '🥗',
        };
        return icons[type] || '🎯';
    };

    const getGoalColor = (type) => {
        const colors = {
            weight_loss: 'bg-blue-100 text-blue-600',
            weight_gain: 'bg-purple-100 text-purple-600',
            exercise: 'bg-green-100 text-green-600',
            bmi_reduction: 'bg-yellow-100 text-yellow-600',
            risk_reduction: 'bg-red-100 text-red-600',
            quit_smoking: 'bg-orange-100 text-orange-600',
            diet: 'bg-pink-100 text-pink-600',
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: { label: 'Active', variant: 'primary' },
            completed: { label: 'Completed', variant: 'success' },
            abandoned: { label: 'Abandoned', variant: 'error' },
        };
        return badges[status] || { label: status, variant: 'default' };
    };

    const handleUpdateProgress = async () => {
        if (selectedGoal && progressValue) {
            const value = parseFloat(progressValue);
            const result = await updateGoal(selectedGoal.id, {
                ...selectedGoal,
                current_value: value,
                status: value >= selectedGoal.target_value ? 'completed' : 'active',
            });
            if (result.success) {
                setShowProgressModal(false);
                setSelectedGoal(null);
                setProgressValue('');
            }
        }
    };

    if (loading.goals) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Health Goals</h1>
                    <p className="text-gray-600">Track and achieve your health objectives</p>
                </div>
                <Link
                    to="/tracking/goals/add"
                    className="btn-primary flex items-center space-x-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Create Goal</span>
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
                            <p className="text-sm text-blue-600">Total Goals</p>
                            <p className="text-2xl font-bold text-blue-700">{goals.length}</p>
                        </div>
                        <TargetIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600">Active</p>
                            <p className="text-2xl font-bold text-green-700">
                                {goals.filter(g => g.status === 'active').length}
                            </p>
                        </div>
                        <ClockIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600">Completed</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {goals.filter(g => g.status === 'completed').length}
                            </p>
                        </div>
                        <TrophyIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600">Success Rate</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {goals.length > 0
                                    ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
                                    : 0}%
                            </p>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-orange-500" />
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
                    { id: 'active', name: 'Active' },
                    { id: 'completed', name: 'Completed' },
                    { id: 'abandoned', name: 'Abandoned' },
                    { id: 'all', name: 'All Goals' },
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

            {/* Goals Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredGoals.map((goal, index) => {
                    const status = getStatusBadge(goal.status);
                    const progress = goal.progress_percentage?.() ||
                        Math.min((goal.current_value / goal.target_value) * 100, 100);
                    const daysLeft = goal.days_remaining?.() || 0;

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl shadow-soft p-6 border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-12 h-12 rounded-lg ${getGoalColor(goal.goal_type)} flex items-center justify-center text-2xl`}>
                                        {getGoalIcon(goal.goal_type)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                                        <p className="text-sm text-gray-500">{goal.goal_type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <Badge variant={status.variant} size="sm">
                                    {status.label}
                                </Badge>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>

                            <div className="space-y-3">
                                <ProgressBar
                                    value={goal.current_value}
                                    max={goal.target_value}
                                    label={`${goal.current_value} / ${goal.target_value} ${goal.unit}`}
                                    showValue
                                    color={goal.status === 'completed' ? 'success' : 'primary'}
                                />

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Target date:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(goal.target_date).toLocaleDateString()}
                                    </span>
                                </div>

                                {goal.status === 'active' && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Days left:</span>
                                        <span className={`font-medium ${daysLeft < 7 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {daysLeft} days
                                        </span>
                                    </div>
                                )}

                                {goal.status === 'completed' && goal.completed_date && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Completed:</span>
                                        <span className="font-medium text-green-600">
                                            {formatDistanceToNow(new Date(goal.completed_date), { addSuffix: true })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {goal.status === 'active' && (
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedGoal(goal);
                                            setProgressValue(goal.current_value.toString());
                                            setShowProgressModal(true);
                                        }}
                                        className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
                                    >
                                        Update Progress
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedGoal(goal);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Empty State */}
            {filteredGoals.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <TargetIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No goals found</p>
                    <Link to="/tracking/goals/add" className="btn-primary inline-block">
                        Create Your First Goal
                    </Link>
                </div>
            )}

            {/* Update Progress Modal */}
            {showProgressModal && selectedGoal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl shadow-soft max-w-md w-full p-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Progress</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Current progress for "{selectedGoal.title}"
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="input-label">
                                    Current Value ({selectedGoal.unit})
                                </label>
                                <input
                                    type="number"
                                    value={progressValue}
                                    onChange={(e) => setProgressValue(e.target.value)}
                                    className="input-field"
                                    min="0"
                                    max={selectedGoal.target_value}
                                    step="0.1"
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Target:</span>
                                    <span className="font-medium">{selectedGoal.target_value} {selectedGoal.unit}</span>
                                </div>
                                <ProgressBar
                                    value={parseFloat(progressValue) || 0}
                                    max={selectedGoal.target_value}
                                    size="sm"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={handleUpdateProgress}
                                    className="flex-1 btn-primary"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => {
                                        setShowProgressModal(false);
                                        setSelectedGoal(null);
                                    }}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={async () => {
                    if (selectedGoal) {
                        await deleteGoal(selectedGoal.id);
                        setShowDeleteModal(false);
                        setSelectedGoal(null);
                    }
                }}
                title="Delete Goal"
                message={`Are you sure you want to delete "${selectedGoal?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                type="danger"
            />
        </div>
    );
};

export default Goals;