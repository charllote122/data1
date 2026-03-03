import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrophyIcon,
    LockClosedIcon,
    CheckCircleIcon,
    StarIcon,
    FireIcon,
} from '@heroicons/react/24/outline';
import { useHealth } from '../../hooks/useHealth';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';

const Milestones = () => {
    const { milestones, userMilestones, getMilestones, getUserMilestones, loading } = useHealth();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMilestones();
    }, []);

    const fetchMilestones = async () => {
        await Promise.all([
            getMilestones(),
            getUserMilestones(),
        ]);
    };

    const userMilestoneIds = userMilestones.map(um => um.milestone.id);

    const filteredMilestones = milestones.filter(milestone => {
        const achieved = userMilestoneIds.includes(milestone.id);
        if (filter === 'achieved') return achieved;
        if (filter === 'pending') return !achieved;
        return true;
    });

    const getMilestoneIcon = (type) => {
        const icons = {
            first_prediction: '🎯',
            five_predictions: '🔍',
            ten_predictions: '📊',
            twenty_five_predictions: '🏆',
            fifty_predictions: '👑',
            risk_reduction_10: '📉',
            risk_reduction_25: '📈',
            risk_reduction_50: '⭐',
            streak_week: '🔥',
            streak_month: '⚡',
            goal_completed: '✅',
            five_goals: '🎯',
            feedback_provided: '💬',
            profile_complete: '📋',
        };
        return icons[type] || '🏅';
    };

    const getMilestoneColor = (type, achieved) => {
        if (!achieved) return 'bg-gray-100 text-gray-400';

        const colors = {
            first_prediction: 'bg-blue-100 text-blue-600',
            five_predictions: 'bg-indigo-100 text-indigo-600',
            ten_predictions: 'bg-purple-100 text-purple-600',
            twenty_five_predictions: 'bg-pink-100 text-pink-600',
            fifty_predictions: 'bg-rose-100 text-rose-600',
            risk_reduction_10: 'bg-green-100 text-green-600',
            risk_reduction_25: 'bg-emerald-100 text-emerald-600',
            risk_reduction_50: 'bg-teal-100 text-teal-600',
            streak_week: 'bg-orange-100 text-orange-600',
            streak_month: 'bg-amber-100 text-amber-600',
            goal_completed: 'bg-lime-100 text-lime-600',
            five_goals: 'bg-yellow-100 text-yellow-600',
            feedback_provided: 'bg-violet-100 text-violet-600',
            profile_complete: 'bg-fuchsia-100 text-fuchsia-600',
        };
        return colors[type] || 'bg-primary-100 text-primary-600';
    };

    const calculateProgress = () => {
        const achieved = userMilestones.length;
        const total = milestones.length;
        return { achieved, total, percentage: total > 0 ? (achieved / total) * 100 : 0 };
    };

    const progress = calculateProgress();

    if (loading.milestones || loading.userMilestones) {
        return <Loader />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-gray-900">Milestones & Achievements</h1>
                <p className="text-gray-600">Track your progress and earn rewards</p>
            </motion.div>

            {/* Progress Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Your Journey</h2>
                        <p className="text-primary-100">You've achieved {progress.achieved} out of {progress.total} milestones</p>
                    </div>
                    <TrophyIcon className="w-16 h-16 text-yellow-300" />
                </div>

                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block text-primary-100">
                                Progress
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-primary-100">
                                {Math.round(progress.percentage)}%
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-primary-300">
                        <div
                            style={{ width: `${progress.percentage}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-3xl font-bold">{progress.achieved}</div>
                        <div className="text-sm text-primary-200">Achieved</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{progress.total - progress.achieved}</div>
                        <div className="text-sm text-primary-200">Remaining</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">{userMilestones.reduce((sum, um) => sum + um.milestone.points, 0)}</div>
                        <div className="text-sm text-primary-200">Total Points</div>
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
                    { id: 'all', name: 'All Milestones' },
                    { id: 'achieved', name: 'Achieved' },
                    { id: 'pending', name: 'Pending' },
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

            {/* Milestones Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredMilestones.map((milestone, index) => {
                    const achieved = userMilestoneIds.includes(milestone.id);
                    const userMilestone = userMilestones.find(um => um.milestone.id === milestone.id);

                    return (
                        <motion.div
                            key={milestone.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-white rounded-xl shadow-soft p-6 border transition-all ${achieved ? 'border-green-200' : 'border-gray-100 opacity-75'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-16 h-16 rounded-xl ${getMilestoneColor(milestone.milestone_type, achieved)} flex items-center justify-center text-3xl`}>
                                    {getMilestoneIcon(milestone.milestone_type)}
                                </div>
                                {achieved ? (
                                    <Badge variant="success" size="sm">
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        Achieved
                                    </Badge>
                                ) : (
                                    <Badge variant="default" size="sm">
                                        <LockClosedIcon className="w-3 h-3 mr-1" />
                                        Locked
                                    </Badge>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">{milestone.description}</p>

                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center text-yellow-600">
                                    <StarIcon className="w-4 h-4 mr-1" />
                                    {milestone.points} points
                                </span>
                                {achieved && userMilestone && (
                                    <span className="text-gray-500">
                                        {new Date(userMilestone.achieved_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            {!achieved && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">
                                        {milestone.criteria?.description || 'Keep going to unlock this milestone!'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Recent Achievements */}
            {userMilestones.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FireIcon className="w-5 h-5 text-orange-500 mr-2" />
                        Recent Achievements
                    </h3>
                    <div className="space-y-3">
                        {userMilestones.slice(0, 5).map((um, index) => (
                            <div key={um.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg ${getMilestoneColor(um.milestone.milestone_type, true)} flex items-center justify-center text-lg`}>
                                        {getMilestoneIcon(um.milestone.milestone_type)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{um.milestone.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(um.achieved_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="success" size="sm">
                                    +{um.milestone.points} pts
                                </Badge>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Milestones;