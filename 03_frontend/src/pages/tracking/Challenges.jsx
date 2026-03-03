import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    TrophyIcon,
    UsersIcon,
    ClockIcon,
    FireIcon,
    CheckCircleIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useHealth } from '../../hooks/useHealth';
import Loader from '../../components/Loader';
import ProgressBar from '../../components/ProgressBar';
import Badge from '../../components/Badge';
import { formatDistanceToNow } from 'date-fns';

const Challenges = () => {
    const { challenges, participations, getChallenges, getParticipations, joinChallenge, loading } = useHealth();
    const [activeTab, setActiveTab] = useState('available');

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        await Promise.all([
            getChallenges(),
            getParticipations(),
        ]);
    };

    const availableChallenges = challenges.filter(c =>
        c.is_active && !participations.some(p => p.challenge.id === c.id)
    );

    const activeChallenges = participations.filter(p => !p.completed_at);
    const completedChallenges = participations.filter(p => p.completed_at);

    const getChallengeIcon = (type) => {
        const icons = {
            steps: '👣',
            weight_loss: '⚖️',
            risk_reduction: '📉',
            prediction_streak: '📊',
            goal_completion: '🎯',
            medication_adherence: '💊',
        };
        return icons[type] || '🏆';
    };

    const getChallengeColor = (type) => {
        const colors = {
            steps: 'bg-blue-100 text-blue-600',
            weight_loss: 'bg-green-100 text-green-600',
            risk_reduction: 'bg-purple-100 text-purple-600',
            prediction_streak: 'bg-orange-100 text-orange-600',
            goal_completion: 'bg-yellow-100 text-yellow-600',
            medication_adherence: 'bg-pink-100 text-pink-600',
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    };

    const handleJoinChallenge = async (challengeId) => {
        await joinChallenge(challengeId);
        await fetchChallenges();
    };

    if (loading.challenges || loading.participations) {
        return <Loader />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-gray-900">Health Challenges</h1>
                <p className="text-gray-600">Join challenges and compete with others</p>
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
                            <p className="text-sm text-blue-600">Available</p>
                            <p className="text-2xl font-bold text-blue-700">{availableChallenges.length}</p>
                        </div>
                        <TrophyIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600">Active</p>
                            <p className="text-2xl font-bold text-green-700">{activeChallenges.length}</p>
                        </div>
                        <FireIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600">Completed</p>
                            <p className="text-2xl font-bold text-purple-700">{completedChallenges.length}</p>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600">Participants</p>
                            <p className="text-2xl font-bold text-orange-700">
                                {challenges.reduce((sum, c) => sum + (c.participants_count || 0), 0)}
                            </p>
                        </div>
                        <UsersIcon className="w-8 h-8 text-orange-500" />
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-soft p-2 border border-gray-100 inline-flex"
            >
                {[
                    { id: 'available', name: 'Available Challenges' },
                    { id: 'active', name: 'My Active Challenges' },
                    { id: 'completed', name: 'Completed' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </motion.div>

            {/* Available Challenges */}
            {activeTab === 'available' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {availableChallenges.map((challenge, index) => {
                        const daysLeft = challenge.days_remaining?.() || 0;

                        return (
                            <motion.div
                                key={challenge.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl shadow-soft p-6 border border-gray-100 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg ${getChallengeColor(challenge.challenge_type)} flex items-center justify-center text-2xl`}>
                                        {getChallengeIcon(challenge.challenge_type)}
                                    </div>
                                    <Badge variant={daysLeft < 7 ? 'warning' : 'primary'} size="sm">
                                        {daysLeft} days left
                                    </Badge>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Target:</span>
                                        <span className="font-medium text-gray-900">
                                            {challenge.target_value} {challenge.unit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Ends:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(challenge.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Participants:</span>
                                        <span className="font-medium text-gray-900">
                                            {challenge.participants_count || 0}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleJoinChallenge(challenge.id)}
                                    className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>Join Challenge</span>
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}

                    {availableChallenges.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No available challenges at the moment</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Active Challenges */}
            {activeTab === 'active' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {activeChallenges.map((participation, index) => {
                        const challenge = participation.challenge;
                        const progress = participation.progress || 0;

                        return (
                            <motion.div
                                key={participation.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl shadow-soft p-6 border border-green-200 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg ${getChallengeColor(challenge.challenge_type)} flex items-center justify-center text-2xl`}>
                                        {getChallengeIcon(challenge.challenge_type)}
                                    </div>
                                    <Badge variant="success" size="sm">Active</Badge>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                                <div className="space-y-3">
                                    <ProgressBar
                                        value={participation.current_value}
                                        max={challenge.target_value}
                                        label={`${participation.current_value} / ${challenge.target_value} ${challenge.unit}`}
                                        showValue
                                        color="primary"
                                    />

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Progress:</span>
                                        <span className="font-medium text-green-600">{progress}%</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Joined:</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDistanceToNow(new Date(participation.joined_at), { addSuffix: true })}
                                        </span>
                                    </div>

                                    <button className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors">
                                        Update Progress
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}

                    {activeChallenges.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <FireIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">No active challenges</p>
                            <button
                                onClick={() => setActiveTab('available')}
                                className="btn-primary"
                            >
                                Browse Challenges
                            </button>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Completed Challenges */}
            {activeTab === 'completed' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {completedChallenges.map((participation, index) => {
                        const challenge = participation.challenge;

                        return (
                            <motion.div
                                key={participation.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl shadow-soft p-6 border border-green-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg ${getChallengeColor(challenge.challenge_type)} flex items-center justify-center text-2xl`}>
                                        {getChallengeIcon(challenge.challenge_type)}
                                    </div>
                                    <Badge variant="success" size="sm">Completed</Badge>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.name}</h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Achieved:</span>
                                        <span className="font-medium text-green-600">
                                            {participation.current_value} / {challenge.target_value} {challenge.unit}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Completed:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(participation.completed_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center">
                                        <span className="text-sm font-medium text-yellow-700">
                                            🏆 Challenge Completed!
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {completedChallenges.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <CheckCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No completed challenges yet</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Challenges;