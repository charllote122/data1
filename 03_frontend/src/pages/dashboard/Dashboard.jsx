// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';
import SignupPrompt from '../../components/SignupPrompt';
import { ROUTES } from '../../constants/routes';
import {
    BeakerIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    PlusCircleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ChevronRightIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    SparklesIcon,
    UserIcon,
    CalendarIcon,
    XMarkIcon,
    InformationCircleIcon,
    BookOpenIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import Card, { StatsCard } from '../../components/Card';
import Badge, { RiskBadge } from '../../components/Badge';
import { PageSpinner, StatsSkeleton } from '../../components/LoadingSpinner';
import { EmptyPredictions } from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';

// ============================================
// Date formatting utilities
// ============================================
const formatDate = (dateString) => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return null;
    }
};

const formatShortDate = (dateString) => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return null;
    }
};

const formatMonthDay = (dateString) => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        return {
            day: date.getDate().toString(),
            month: date.toLocaleDateString('en-US', { month: 'short' })
        };
    } catch (error) {
        return null;
    }
};

const getRelativeTime = (dateString) => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

        return formatShortDate(dateString);
    } catch (error) {
        return null;
    }
};

const calculateAge = (dob) => {
    if (!dob) return null;
    try {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (error) {
        return null;
    }
};

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: healthLoading } = useHealth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // State management
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [remainingPredictions, setRemainingPredictions] = useState(3);
    const [timeGreeting, setTimeGreeting] = useState('');
    const [showWelcomeBack, setShowWelcomeBack] = useState(true);
    const [showDemoMode, setShowDemoMode] = useState(false);
    const [error, setError] = useState(null);
    const [dailyTip, setDailyTip] = useState(null);
    const [sharingPrediction, setSharingPrediction] = useState(null);

    // Set greeting based on time of day
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setTimeGreeting('Good morning');
        else if (hour < 18) setTimeGreeting('Good afternoon');
        else setTimeGreeting('Good evening');
    }, []);

    // Load remaining predictions from localStorage for guest users
    useEffect(() => {
        const remaining = localStorage.getItem('remaining_predictions');
        if (remaining) {
            setRemainingPredictions(parseInt(remaining));
        }
    }, []);

    // Hide welcome back banner after 5 seconds
    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                setShowWelcomeBack(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Calculate BMI from profile with proper formatting
    const calculateBMI = useCallback(() => {
        if (profile?.height && profile?.weight) {
            const heightInMeters = profile.height / 100;
            const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
            return bmi;
        }
        return null;
    }, [profile]);

    const bmi = calculateBMI();

    // Get demo data for guests
    const getDemoData = useCallback(() => ({
        stats: {
            total_predictions: 0
        },
        recent_predictions: [],
    }), []);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        setError(null);

        try {
            let data;

            if (user) {
                data = await api.getDashboard();
                if (showRefresh) {
                    showNotification('success', 'Dashboard updated');
                }
            } else {
                data = await api.getPublicDashboard();
                if (data?.remaining_attempts !== undefined) {
                    setRemainingPredictions(data.remaining_attempts);
                    localStorage.setItem('remaining_predictions', data.remaining_attempts);
                }
                if (showRefresh) {
                    showNotification('success', 'Guest dashboard updated');
                }
            }

            setDashboardData(data);
        } catch (error) {
            console.error('Dashboard error:', error);
            setError(error.message || 'Failed to load dashboard');

            if (error.status === 429) {
                setShowSignupPrompt(true);
                showNotification('warning', 'Rate limit reached. Sign up for unlimited access!');
            }

            if (!user) {
                setShowDemoMode(true);
                setDashboardData(getDemoData());
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user, showNotification, getDemoData]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Generate daily health tip based on user's health data
    useEffect(() => {
        const generatePersonalizedTip = () => {
            const tips = [
                {
                    title: 'Stay Hydrated',
                    description: 'Drinking water helps maintain normal blood sugar levels. Aim for 8 glasses daily.',
                    icon: HeartIcon,
                    color: 'blue'
                },
                {
                    title: 'Monitor Blood Sugar',
                    description: 'Regular monitoring helps you understand how food and activities affect your levels.',
                    icon: BeakerIcon,
                    color: 'purple'
                },
                {
                    title: 'Balanced Diet',
                    description: 'Include fiber-rich foods like vegetables, legumes, and whole grains to stabilize blood sugar.',
                    icon: HeartIcon,
                    color: 'green'
                },
                {
                    title: 'Track Symptoms',
                    description: 'Logging symptoms helps identify patterns and triggers in your health.',
                    icon: DocumentTextIcon,
                    color: 'orange'
                },
                {
                    title: 'Regular Exercise',
                    description: 'Aim for 30 minutes of moderate activity daily to improve insulin sensitivity.',
                    icon: SparklesIcon,
                    color: 'pink'
                }
            ];

            // Personalize tip based on BMI if available
            if (bmi) {
                const bmiNum = parseFloat(bmi);
                if (bmiNum > 30) {
                    tips.push({
                        title: 'Weight Management',
                        description: 'Consider consulting a nutritionist for a personalized weight management plan.',
                        icon: HeartIcon,
                        color: 'red'
                    });
                } else if (bmiNum < 18.5) {
                    tips.push({
                        title: 'Healthy Weight Gain',
                        description: 'Focus on nutrient-dense foods to achieve a healthy BMI range.',
                        icon: HeartIcon,
                        color: 'yellow'
                    });
                }
            }

            setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
        };

        generatePersonalizedTip();
    }, [bmi]);

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    const handleAction = (path, requiresAuth = true) => {
        if (requiresAuth && !user) {
            setShowSignupPrompt(true);
            return;
        }
        navigate(path);
    };

    // Share prediction function
    const handleSharePrediction = async (prediction) => {
        try {
            setSharingPrediction(prediction.id);

            // Format the prediction data for sharing
            const shareData = {
                title: 'My Diabetes Risk Assessment',
                text: `My diabetes risk level is ${prediction.risk_level || 'Unknown'}. Check yours at Diabetes Predictor!`,
                url: window.location.origin + ROUTES.PREDICTIONS.DETAIL.replace(':id', prediction.id)
            };

            // Check if Web Share API is supported
            if (navigator.share) {
                await navigator.share(shareData);
                showNotification('success', 'Shared successfully!');
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(
                    `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`
                );
                showNotification('success', 'Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Share error:', error);
            if (error.name !== 'AbortError') {
                showNotification('error', 'Failed to share. Please try again.');
            }
        } finally {
            setSharingPrediction(null);
        }
    };

    const getBMICategory = (bmi) => {
        const bmiNum = parseFloat(bmi);
        if (isNaN(bmiNum)) return null;
        if (bmiNum < 18.5) return 'Underweight';
        if (bmiNum < 25) return 'Normal weight';
        if (bmiNum < 30) return 'Overweight';
        return 'Obese';
    };

    const getRiskLevelColor = (riskLevel) => {
        const level = riskLevel?.toLowerCase() || 'unknown';
        switch (level) {
            case 'high': return 'red';
            case 'moderate': return 'yellow';
            case 'low': return 'green';
            default: return 'gray';
        }
    };

    // Prepare data for rendering
    const data = dashboardData?.data || dashboardData || {};
    const stats = data.stats || {};
    const recentPredictions = data.recent_predictions || [];

    // Stats for authenticated users - only show if there's actual data
    const authenticatedStats = [
        ...(stats.total_predictions ? [{
            title: 'Risk Assessments',
            value: stats.total_predictions,
            icon: BeakerIcon,
            color: 'blue',
            link: ROUTES.HISTORY,
        }] : []),
        ...(stats.current_risk ? [{
            title: 'Current Risk',
            value: stats.current_risk,
            icon: ShieldCheckIcon,
            color: getRiskLevelColor(stats.current_risk),
            link: ROUTES.PREDICTIONS.NEW,
        }] : []),
        ...(profile ? [{
            title: 'Health Profile',
            value: 'Complete',
            icon: UserIcon,
            color: 'green',
            link: ROUTES.PROFILE,
        }] : []),
        ...(bmi ? [{
            title: 'BMI',
            value: bmi,
            subtitle: getBMICategory(bmi),
            icon: HeartIcon,
            color: 'purple',
            link: ROUTES.PROFILE,
        }] : []),
    ];

    // Stats for guest users
    const guestStats = [
        {
            title: 'Free Assessments',
            value: remainingPredictions,
            icon: BeakerIcon,
            color: 'blue',
            link: ROUTES.PREDICTIONS.NEW
        },
        {
            title: 'Accuracy Rate',
            value: '95%',
            subtitle: 'ML Model',
            icon: ShieldCheckIcon,
            color: 'green',
        },
        {
            title: 'Free Forever',
            value: 'Basic Tier',
            subtitle: 'No credit card',
            icon: SparklesIcon,
            color: 'purple',
            link: ROUTES.REGISTER
        },
    ];

    const statsToShow = user ? authenticatedStats : guestStats;

    // Quick actions
    const quickActions = user ? [
        {
            title: 'New Prediction',
            description: 'Assess your risk',
            icon: BeakerIcon,
            color: 'blue',
            action: () => handleAction(ROUTES.PREDICTIONS.NEW, true),
        },
        {
            title: 'Log Symptoms',
            description: 'Track how you feel',
            icon: HeartIcon,
            color: 'pink',
            action: () => handleAction(ROUTES.SYMPTOMS.NEW, true),
        },
        {
            title: 'Medications',
            description: 'Manage meds',
            icon: DocumentTextIcon,
            color: 'indigo',
            action: () => handleAction(ROUTES.MEDICATIONS.LIST, true),
        },
        {
            title: 'Health Profile',
            description: 'Update metrics',
            icon: UserIcon,
            color: 'green',
            action: () => handleAction(ROUTES.PROFILE, true),
        },
        {
            title: 'View History',
            description: 'Past assessments',
            icon: ClockIcon,
            color: 'purple',
            action: () => handleAction(ROUTES.HISTORY, true),
        },
        {
            title: 'Health Coach',
            description: 'AI assistant',
            icon: SparklesIcon,
            color: 'orange',
            action: () => handleAction(ROUTES.HEALTH_COACH.HOME, true),
        },
    ] : [
        {
            title: 'Free Assessment',
            description: `${remainingPredictions} ${remainingPredictions === 1 ? 'try' : 'tries'} left`,
            icon: BeakerIcon,
            color: 'blue',
            action: () => handleAction(ROUTES.PREDICTIONS.NEW, false)
        },
        {
            title: 'Sign Up',
            description: 'Unlock all features',
            icon: UserIcon,
            color: 'green',
            action: () => navigate(ROUTES.REGISTER)
        },
        {
            title: 'How It Works',
            description: 'Learn more',
            icon: BookOpenIcon,
            color: 'purple',
            action: () => navigate(ROUTES.HOME)
        },
    ];

    // Loading state
    if (loading || authLoading || healthLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <StatsSkeleton />
            </div>
        );
    }

    // Error state
    if (error && !dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <ErrorMessage
                        message={error}
                        onRetry={() => window.location.reload()}
                        type="error"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Welcome Back Banner */}
            <AnimatePresence>
                {user && showWelcomeBack && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-primary-600 to-primary-500 text-white"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Welcome back, {user?.first_name || user?.username || 'User'}! 👋
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowWelcomeBack(false)}
                                    className="text-white/80 hover:text-white"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Guest Banner */}
            <AnimatePresence>
                {!user && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-primary-600 to-primary-500 text-white"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        ✨ You have <span className="font-bold mx-1">{remainingPredictions}</span>
                                        free {remainingPredictions === 1 ? 'assessment' : 'assessments'} remaining
                                    </span>
                                </div>
                                <Link
                                    to={ROUTES.REGISTER}
                                    className="text-xs bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
                                >
                                    Sign Up Free →
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Demo Mode Banner */}
            {showDemoMode && !user && (
                <div className="bg-primary-50 border-b border-primary-200">
                    <div className="max-w-7xl mx-auto px-4 py-2">
                        <p className="text-xs text-primary-700 text-center">
                            📊 Showing demo data. Sign up to track your real health metrics!
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {timeGreeting}, {user?.first_name || user?.username || 'Guest'}!
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {user
                                ? 'Here\'s your personalized health overview'
                                : 'Try our free diabetes risk assessment'}
                        </p>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </motion.div>

                {/* Stats Grid - Only render if there are stats */}
                {statsToShow.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8"
                    >
                        {statsToShow.map((stat, index) => (
                            <StatsCard
                                key={index}
                                title={stat.title}
                                value={stat.value}
                                subtitle={stat.subtitle}
                                icon={stat.icon}
                                color={stat.color}
                                onClick={() => user && stat.link && navigate(stat.link)}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 md:mb-8"
                >
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                        {user ? 'Quick Actions' : 'Get Started'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={action.action}
                                className="bg-white p-4 rounded-xl border border-gray-200 text-left hover:border-primary-300 hover:shadow-md transition-all"
                                disabled={!user && action.title === 'Free Assessment' && remainingPredictions === 0}
                            >
                                <div className={`w-10 h-10 bg-${action.color}-50 rounded-lg flex items-center justify-center mb-3`}>
                                    <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                                </div>
                                <h3 className="font-medium text-gray-900 text-xs md:text-sm mb-1">{action.title}</h3>
                                <p className="text-[10px] md:text-xs text-gray-500">{action.description}</p>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Recent Predictions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <Card className="h-full">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                        {user ? 'Recent Assessments' : 'Sample Assessments'}
                                    </h2>
                                    {user && recentPredictions.length > 0 && (
                                        <Link
                                            to={ROUTES.HISTORY}
                                            className="text-xs md:text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                        >
                                            View all
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {recentPredictions.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentPredictions.slice(0, 5).map((pred, index) => {
                                            // Get formatted date parts
                                            const dateStr = pred.date || pred.created_at;
                                            const dateParts = formatMonthDay(dateStr);
                                            const relativeTime = getRelativeTime(dateStr);
                                            const shortDate = formatShortDate(dateStr);

                                            return (
                                                <div
                                                    key={pred.id || index}
                                                    className="group relative"
                                                >
                                                    <div
                                                        onClick={() => user && pred.id && navigate(ROUTES.PREDICTIONS.DETAIL.replace(':id', pred.id))}
                                                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                                                    >
                                                        <div className="flex items-center gap-4 flex-1">
                                                            {dateParts && (
                                                                <div className="text-center min-w-[48px]">
                                                                    <div className="text-sm font-bold text-gray-900">
                                                                        {dateParts.day}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {dateParts.month}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <h3 className="font-medium text-gray-900 text-sm">Diabetes Risk Assessment</h3>
                                                                <div className="flex items-center gap-2">
                                                                    {shortDate && (
                                                                        <p className="text-xs text-gray-500">
                                                                            {shortDate}
                                                                        </p>
                                                                    )}
                                                                    {relativeTime && (
                                                                        <span className="text-xs text-gray-400">
                                                                            ({relativeTime})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {pred.risk_level && (
                                                                <RiskBadge
                                                                    level={pred.risk_level.toLowerCase()}
                                                                    size="sm"
                                                                />
                                                            )}
                                                            {user && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleSharePrediction(pred);
                                                                    }}
                                                                    disabled={sharingPrediction === pred.id}
                                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                                    title="Share"
                                                                >
                                                                    {sharingPrediction === pred.id ? (
                                                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                                    ) : (
                                                                        <ShareIcon className="w-4 h-4" />
                                                                    )}
                                                                </button>
                                                            )}
                                                            {user && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyPredictions onAction={() => handleAction(ROUTES.PREDICTIONS.NEW, false)} />
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Right Column - Daily Tip & Health Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Daily Health Tip */}
                        {dailyTip && (
                            <Card gradient className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <SparklesIcon className="w-5 h-5 text-primary-600" />
                                    <h3 className="font-semibold text-primary-900">Daily Health Tip</h3>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 bg-${dailyTip.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <dailyTip.icon className={`w-5 h-5 text-${dailyTip.color}-600`} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-1 text-sm">{dailyTip.title}</h4>
                                        <p className="text-xs text-gray-600">{dailyTip.description}</p>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Health Summary for Authenticated Users - Only show sections with data */}
                        {user && profile && (
                            <Card>
                                <h3 className="font-semibold text-gray-900 mb-4">Health Summary</h3>
                                <div className="space-y-3">
                                    {profile.height && profile.weight && bmi && getBMICategory(bmi) && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">BMI</span>
                                            <div className="text-right">
                                                <span className="font-medium text-gray-900">{bmi}</span>
                                                <Badge variant={getBMICategory(bmi).toLowerCase().replace(' ', '-')} size="sm" className="ml-2">
                                                    {getBMICategory(bmi)}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    {profile.blood_type && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Blood Type</span>
                                            <span className="font-medium text-gray-900">{profile.blood_type}</span>
                                        </div>
                                    )}
                                    {profile.date_of_birth && calculateAge(profile.date_of_birth) && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Age</span>
                                            <span className="font-medium text-gray-900">
                                                {calculateAge(profile.date_of_birth)} years
                                            </span>
                                        </div>
                                    )}
                                    {profile.gender && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Gender</span>
                                            <span className="font-medium text-gray-900 capitalize">{profile.gender}</span>
                                        </div>
                                    )}
                                    {profile.activity_level && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-sm text-gray-600">Activity Level</span>
                                            <span className="font-medium text-gray-900 capitalize">{profile.activity_level}</span>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to={ROUTES.PROFILE}
                                    className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                >
                                    Update Profile
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Link>
                            </Card>
                        )}

                        {/* Features Teaser for Guests */}
                        {!user && (
                            <Card gradient className="bg-gradient-to-r from-primary-50 to-secondary-50">
                                <h3 className="font-semibold text-primary-900 mb-3">Unlock with Sign Up</h3>
                                <div className="space-y-2 text-sm text-primary-700">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>Unlimited predictions</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>Save history & track progress</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>Medication reminders</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>Symptom tracking</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>AI Health Coach access</span>
                                    </div>
                                </div>
                                <Link
                                    to={ROUTES.REGISTER}
                                    className="mt-4 block text-center bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition"
                                >
                                    Sign Up Free
                                </Link>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Signup Prompt Modal */}
            <SignupPrompt
                isOpen={showSignupPrompt}
                onClose={() => setShowSignupPrompt(false)}
                context={!user ? 'free_predictions' : 'premium_feature'}
                remainingPredictions={remainingPredictions}
            />
        </div>
    );
};

export default Dashboard;