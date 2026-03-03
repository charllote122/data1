import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FireIcon,
    CalendarIcon,
    ClockIcon,
    TrophyIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { useHealth } from '../../hooks/useHealth';
import { usePredictions } from '../../hooks/usePredictions';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import { format, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

const Streaks = () => {
    const { predictions, getPredictions } = usePredictions();
    const { milestones, userMilestones, getMilestones, getUserMilestones } = useHealth();
    const [loading, setLoading] = useState(true);
    const [streakData, setStreakData] = useState({
        current: 0,
        longest: 0,
        history: [],
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            getPredictions(),
            getMilestones(),
            getUserMilestones(),
        ]);
        calculateStreaks();
        setLoading(false);
    };

    const calculateStreaks = () => {
        if (!predictions.length) return;

        // Sort predictions by date
        const sortedPredictions = [...predictions].sort(
            (a, b) => new Date(a.prediction_date) - new Date(b.prediction_date)
        );

        // Get unique dates
        const uniqueDates = [];
        const dateMap = new Map();

        sortedPredictions.forEach(p => {
            const date = format(new Date(p.prediction_date), 'yyyy-MM-dd');
            if (!dateMap.has(date)) {
                dateMap.set(date, true);
                uniqueDates.push(new Date(p.prediction_date));
            }
        });

        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let streakCount = 0;
        let lastDate = null;

        // Create history of last 30 days
        const today = new Date();
        const last30Days = eachDayOfInterval({
            start: subDays(today, 29),
            end: today,
        });

        const history = last30Days.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const hasPrediction = uniqueDates.some(d =>
                format(d, 'yyyy-MM-dd') === dateStr
            );

            // Update streak calculation
            if (hasPrediction) {
                if (lastDate && isSameDay(date, new Date(lastDate.getTime() + 86400000))) {
                    streakCount++;
                } else {
                    streakCount = 1;
                }
                lastDate = date;
            } else {
                streakCount = 0;
                lastDate = null;
            }

            currentStreak = streakCount;
            longestStreak = Math.max(longestStreak, streakCount);

            return {
                date: format(date, 'MMM dd'),
                fullDate: date,
                hasPrediction,
                isToday: isSameDay(date, today),
            };
        });

        setStreakData({
            current: currentStreak,
            longest: longestStreak,
            history,
        });
    };

    const getStreakMilestones = () => {
        return milestones.filter(m =>
            m.milestone_type.includes('streak')
        );
    };

    const getAchievedStreakMilestones = () => {
        return userMilestones.filter(um =>
            um.milestone.milestone_type.includes('streak')
        );
    };

    const streakMilestones = getStreakMilestones();
    const achievedStreakMilestones = getAchievedStreakMilestones();

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-gray-900">Streak Tracker</h1>
                <p className="text-gray-600">Track your consistency and build healthy habits</p>
            </motion.div>

            {/* Current Streak Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Current Streak</h2>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-6xl font-bold">{streakData.current}</span>
                            <span className="text-xl">days</span>
                        </div>
                        <p className="text-orange-100 mt-2">
                            Longest streak: {streakData.longest} days
                        </p>
                    </div>
                    <FireIcon className="w-24 h-24 text-orange-300" />
                </div>
            </motion.div>

            {/* Streak Calendar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-primary-600" />
                    Last 30 Days
                </h3>

                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                            {day}
                        </div>
                    ))}

                    {streakData.history.map((day, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className={`
                aspect-square rounded-lg flex items-center justify-center text-sm
                ${day.hasPrediction
                                    ? 'bg-green-500 text-white'
                                    : day.isToday
                                        ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500'
                                        : 'bg-gray-100 text-gray-400'
                                }
              `}
                        >
                            {format(day.fullDate, 'd')}
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600">Active day</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                        <span className="text-gray-600">Today</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-100 rounded"></div>
                        <span className="text-gray-600">Inactive</span>
                    </div>
                </div>
            </motion.div>

            {/* Streak Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Total Active Days</h4>
                        <ClockIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{predictions.length}</p>
                    <p className="text-sm text-gray-500 mt-1">lifetime predictions</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Streak Milestones</h4>
                        <TrophyIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{achievedStreakMilestones.length}</p>
                    <p className="text-sm text-gray-500 mt-1">out of {streakMilestones.length}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Consistency</h4>
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {streakData.longest > 0
                            ? Math.round((streakData.history.filter(d => d.hasPrediction).length / 30) * 100)
                            : 0}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">last 30 days</p>
                </motion.div>
            </div>

            {/* Streak Milestones */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Streak Milestones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {streakMilestones.map(milestone => {
                        const achieved = achievedStreakMilestones.some(
                            um => um.milestone.id === milestone.id
                        );
                        const required = milestone.criteria?.streak_days || 0;

                        return (
                            <div
                                key={milestone.id}
                                className={`p-4 rounded-lg border ${achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-2xl">{milestone.icon}</span>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                                        <p className="text-xs text-gray-500">{milestone.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-600">Requires {required} days</span>
                                    {achieved ? (
                                        <Badge variant="success" size="sm">Achieved</Badge>
                                    ) : (
                                        <Badge variant="default" size="sm">
                                            {streakData.current}/{required}
                                        </Badge>
                                    )}
                                </div>

                                {!achieved && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-primary-600 h-1.5 rounded-full"
                                                style={{ width: `${Math.min((streakData.current / required) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Tips */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-primary-50 rounded-lg p-4"
            >
                <h4 className="font-medium text-primary-800 mb-2">💡 Tips to Maintain Your Streak</h4>
                <ul className="space-y-2 text-sm text-primary-700">
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Log your health data daily to maintain consistency</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Set reminders to complete your daily check-ins</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Don't break the chain - mark your progress each day</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span>•</span>
                        <span>Celebrate reaching new streak milestones!</span>
                    </li>
                </ul>
            </motion.div>
        </div>
    );
};

export default Streaks;