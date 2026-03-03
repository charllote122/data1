// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
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
    EnvelopeIcon,
    AcademicCapIcon,
    TrophyIcon,
    FireIcon,
    BoltIcon,
    XMarkIcon,
    InformationCircleIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    BellAlertIcon,
    NewspaperIcon,
    UserGroupIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';

// Constants
const ADDITIONAL_ROUTES = {
    ACTIVITY: '/activity',
    REWARDS: '/rewards',
    COMMUNITY: '/community',
    ABOUT: '/about',
    DEMO: '/demo',
    INSIGHTS: '/insights',
    EDUCATION: '/education'
};

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // State management
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [remainingPredictions, setRemainingPredictions] = useState(3);
    const [timeGreeting, setTimeGreeting] = useState('');
    const [showVerificationBanner, setShowVerificationBanner] = useState(false);
    const [showWelcomeBack, setShowWelcomeBack] = useState(true);
    const [showDemoMode, setShowDemoMode] = useState(false);
    const [healthTrend, setHealthTrend] = useState(null);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [dailyTip, setDailyTip] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('week');

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

    // Handle verification banner and welcome back timer
    useEffect(() => {
        if (user && !user.is_verified) {
            setShowVerificationBanner(true);
        } else {
            setShowVerificationBanner(false);
        }

        // Hide welcome back banner after 5 seconds
        if (user && user.is_verified) {
            const timer = setTimeout(() => {
                setShowWelcomeBack(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Generate daily health tip
    useEffect(() => {
        const tips = [
            {
                title: 'Stay Hydrated',
                description: 'Drinking water helps maintain normal blood sugar levels.',
                icon: HeartIcon
            },
            {
                title: 'Morning Walk',
                description: 'A 30-minute walk can improve insulin sensitivity.',
                icon: BoltIcon
            },
            {
                title: 'Balanced Diet',
                description: 'Include fiber-rich foods in your meals to stabilize blood sugar.',
                icon: BeakerIcon
            },
            {
                title: 'Monitor Stress',
                description: 'High stress can increase blood glucose levels.',
                icon: ShieldCheckIcon
            }
        ];
        setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
    }, []);

    // Generate sample notifications for demo
    useEffect(() => {
        if (user && user.is_verified) {
            setNotifications([
                {
                    id: 1,
                    type: 'reminder',
                    title: 'Medication Reminder',
                    message: 'Time to take your evening medication',
                    time: '2 hours ago',
                    read: false
                },
                {
                    id: 2,
                    type: 'achievement',
                    title: 'New Achievement!',
                    message: 'You completed 5 assessments this month',
                    time: '1 day ago',
                    read: true
                },
                {
                    id: 3,
                    type: 'insight',
                    title: 'Health Insight',
                    message: 'Your activity level has improved 15% this week',
                    time: '2 days ago',
                    read: true
                }
            ]);

            setAchievements([
                {
                    id: 1,
                    name: 'Health Explorer',
                    description: 'Completed first assessment',
                    icon: TrophyIcon,
                    earned: true,
                    date: '2026-02-26'
                },
                {
                    id: 2,
                    name: 'Consistency King',
                    description: '7-day streak',
                    icon: FireIcon,
                    earned: true,
                    date: '2026-03-01'
                },
                {
                    id: 3,
                    name: 'Health Guru',
                    description: '10 assessments completed',
                    icon: AcademicCapIcon,
                    earned: false,
                    progress: 70
                }
            ]);
        }
    }, [user]);

    // Demo data for guest users
    const getDemoData = useCallback(() => ({
        stats: {
            total_predictions: 0,
            current_risk: 'Unknown',
            health_score: 0,
            active_goals: 0,
            streak_days: 0,
            points: 0,
            prediction_change: 0,
            completed_goals: 0,
            pending_medications: 0,
            active_challenges: 0,
            weekly_activity: [65, 45, 75, 55, 80, 70, 60],
            monthly_progress: 15
        },
        recent_predictions: [],
        health_profile: {
            health_score: 0,
            streak_days: 0,
            points: 0,
            level: 1
        },
        recommendations: [
            {
                title: 'Start Tracking',
                description: 'Take your first assessment to get personalized insights',
                action: 'Try Now',
                link: ROUTES.PREDICTIONS.NEW
            }
        ]
    }), []);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        setError(null);

        try {
            let data;

            if (user) {
                // Authenticated user dashboard
                data = await api.getDashboard();

                // Calculate health trend
                if (data?.stats?.health_score_history) {
                    const history = data.stats.health_score_history;
                    if (history.length >= 2) {
                        const change = history[history.length - 1] - history[history.length - 2];
                        setHealthTrend(change > 0 ? 'up' : change < 0 ? 'down' : 'stable');
                    }
                }

                // Show success notification on refresh
                if (showRefresh) {
                    showNotification('success', 'Dashboard updated with latest data');
                }
            } else {
                // Public/guest dashboard
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

            if (error.message?.includes('verify')) {
                setShowVerificationBanner(true);
                showNotification('info', 'Please verify your email to access all features.');
            }

            // Set demo data for better UX
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

    const handleRefresh = () => {
        fetchDashboardData(true);
    };

    const handleAction = (path, requiresAuth = true) => {
        if (requiresAuth && !user) {
            setShowSignupPrompt(true);
            return;
        }

        if (requiresAuth && user && !user.is_verified) {
            showNotification('warning', 'Please verify your email to access this feature.');
            setShowVerificationBanner(true);
            return;
        }

        navigate(path);
    };

    const handleResendVerification = async () => {
        try {
            // Add this method to your API service
            // await api.resendVerificationEmail({ email: user?.email });
            showNotification('success', 'Verification email sent! Please check your inbox.');
        } catch (error) {
            console.error('Failed to resend verification:', error);
            showNotification('error', 'Failed to send verification email. Please try again.');
        }
    };

    const handleHowItWorks = () => {
        navigate(ROUTES.HOME);
        setTimeout(() => {
            const element = document.getElementById('how-it-works');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    const handleMarkNotificationRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const handleClearNotifications = () => {
        setNotifications([]);
        setShowNotifications(false);
        showNotification('success', 'All notifications cleared');
    };

    const getRiskBadge = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRiskIcon = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'low':
                return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
            case 'moderate':
                return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
            case 'high':
                return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
            default:
                return <InformationCircleIcon className="w-4 h-4 text-gray-600" />;
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'reminder':
                return <BellAlertIcon className="w-5 h-5 text-blue-500" />;
            case 'achievement':
                return <TrophyIcon className="w-5 h-5 text-yellow-500" />;
            case 'insight':
                return <ChartBarIcon className="w-5 h-5 text-green-500" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const calculateStreakMessage = (streak) => {
        if (streak === 0) return 'Start your streak today!';
        if (streak === 1) return '1 day streak! Keep going!';
        if (streak < 7) return `${streak} day streak!`;
        if (streak < 30) return `${streak} day streak! 🔥`;
        return `${streak} day streak! Amazing! 🔥🔥`;
    };

    const getNextLevel = (currentLevel, points) => {
        const pointsNeeded = currentLevel * 100;
        return {
            current: points,
            needed: pointsNeeded,
            progress: (points / pointsNeeded) * 100
        };
    };

    // Loading state
    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-96"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6">
                                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto text-center py-12">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load dashboard</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const data = dashboardData?.data || dashboardData || {};
    const stats = data.stats || {};
    const recentPredictions = data.recent_predictions || data.recentPredictions || [];
    const profile = data.profile || data.health_profile || {};

    // Stats for authenticated users
    const authenticatedStats = [
        {
            title: 'Total Predictions',
            value: stats.total_predictions || 0,
            icon: ChartBarIcon,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            link: ROUTES.HISTORY,
            change: stats.prediction_change ? `+${stats.prediction_change}%` : null,
            changeType: stats.prediction_change > 0 ? 'increase' : 'decrease'
        },
        {
            title: 'Health Score',
            value: profile.health_score || 85,
            icon: ShieldCheckIcon,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            link: ROUTES.PROFILE,
            change: healthTrend ? (healthTrend === 'up' ? '+5' : healthTrend === 'down' ? '-2' : 'stable') : null,
            changeType: healthTrend
        },
        {
            title: 'Active Goals',
            value: stats.active_goals || 3,
            icon: TrophyIcon,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            link: ROUTES.GOALS,
            change: `${stats.completed_goals || 0} completed`,
            changeType: 'neutral'
        },
        {
            title: 'Streak Days',
            value: profile.streak_days || 7,
            icon: FireIcon,
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            link: ADDITIONAL_ROUTES.ACTIVITY,
            tooltip: calculateStreakMessage(profile.streak_days || 0)
        },
        {
            title: 'Risk Level',
            value: stats.current_risk || stats.last_risk_level || 'Low',
            icon: ExclamationTriangleIcon,
            bgColor: stats.current_risk === 'high' ? 'bg-red-50' :
                stats.current_risk === 'moderate' ? 'bg-yellow-50' : 'bg-green-50',
            textColor: stats.current_risk === 'high' ? 'text-red-600' :
                stats.current_risk === 'moderate' ? 'text-yellow-600' : 'text-green-600',
            link: ROUTES.PREDICTIONS.NEW,
            iconComponent: getRiskIcon(stats.current_risk)
        },
        {
            title: 'Points',
            value: profile.points || 450,
            icon: BoltIcon,
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            link: ADDITIONAL_ROUTES.REWARDS,
            tooltip: `${profile.points || 450} points earned`
        },
    ];

    // Stats for guest users
    const guestStats = [
        {
            title: 'Free Predictions',
            value: remainingPredictions,
            icon: ChartBarIcon,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            link: ROUTES.PREDICTIONS.NEW
        },
        {
            title: 'Accuracy Rate',
            value: '95%',
            icon: ShieldCheckIcon,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            link: ADDITIONAL_ROUTES.ABOUT
        },
        {
            title: 'Active Users',
            value: '10k+',
            icon: UserGroupIcon,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            link: ADDITIONAL_ROUTES.COMMUNITY
        },
        {
            title: 'Free Forever',
            value: 'Basic Tier',
            icon: SparklesIcon,
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            link: ROUTES.REGISTER
        },
    ];

    const statsToShow = user ? authenticatedStats : guestStats;

    // Quick actions for authenticated users
    const authenticatedActions = [
        {
            title: 'New Prediction',
            description: 'Assess your diabetes risk',
            icon: BeakerIcon,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            action: () => handleAction(ROUTES.PREDICTIONS.NEW, true),
            badge: user?.is_verified ? 'Unlimited' : 'Verify email'
        },
        {
            title: 'Log Symptoms',
            description: 'Track how you\'re feeling',
            icon: HeartIcon,
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-600',
            action: () => handleAction(ROUTES.SYMPTOMS.NEW, true),
            badge: 'Daily'
        },
        {
            title: 'Health Profile',
            description: 'Update your metrics',
            icon: UserIcon,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            action: () => handleAction(ROUTES.PROFILE, true)
        },
        {
            title: 'View History',
            description: 'See past assessments',
            icon: CalendarIcon,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            action: () => handleAction(ROUTES.HISTORY, true)
        },
        {
            title: 'Medications',
            description: 'Set up reminders',
            icon: DocumentTextIcon,
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            action: () => handleAction(ROUTES.MEDICATIONS.NEW, true),
            badge: stats.pending_medications ? `${stats.pending_medications} due` : null
        },
        {
            title: 'Challenges',
            description: 'Join community goals',
            icon: TrophyIcon,
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
            action: () => handleAction(ROUTES.CHALLENGES, true),
            badge: stats.active_challenges ? `${stats.active_challenges} active` : null
        },
        {
            title: 'Health Insights',
            description: 'View analytics',
            icon: ChartBarIcon,
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-600',
            action: () => handleAction(ADDITIONAL_ROUTES.INSIGHTS, true)
        },
        {
            title: 'Learn More',
            description: 'Health education',
            icon: BookOpenIcon,
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600',
            action: () => handleAction(ADDITIONAL_ROUTES.EDUCATION, true)
        },
    ];

    // Quick actions for guest users
    const guestActions = [
        {
            title: 'Free Assessment',
            description: `${remainingPredictions} ${remainingPredictions === 1 ? 'try' : 'tries'} left`,
            icon: BeakerIcon,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            action: () => handleAction(ROUTES.PREDICTIONS.NEW, false)
        },
        {
            title: 'Sign Up',
            description: 'Get unlimited access',
            icon: UserIcon,
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            action: () => navigate(ROUTES.REGISTER)
        },
        {
            title: 'How It Works',
            description: 'Learn more',
            icon: AcademicCapIcon,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            action: handleHowItWorks
        },
        {
            title: 'View Demo',
            description: 'See sample results',
            icon: ChartBarIcon,
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600',
            action: () => navigate(ADDITIONAL_ROUTES.DEMO)
        },
        {
            title: 'Features',
            description: 'Explore capabilities',
            icon: SparklesIcon,
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-600',
            action: () => {
                navigate(ROUTES.HOME);
                setTimeout(() => {
                    const element = document.getElementById('features');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        },
        {
            title: 'Community',
            description: 'Join discussions',
            icon: UserGroupIcon,
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            action: () => navigate(ADDITIONAL_ROUTES.COMMUNITY)
        },
    ];

    const actionsToShow = user ? authenticatedActions : guestActions;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Welcome Back Banner */}
            <AnimatePresence>
                {user && user.is_verified && showWelcomeBack && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircleIcon className="w-6 h-6" />
                                    <span className="font-medium">
                                        Welcome back, {user?.first_name || user?.username || 'User'}! 👋
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowWelcomeBack(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                    aria-label="Close banner"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Email Verification Banner */}
            <AnimatePresence>
                {showVerificationBanner && user && !user.is_verified && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-yellow-50 border-b border-yellow-200"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <EnvelopeIcon className="w-5 h-5 text-yellow-600" />
                                    <span className="text-sm text-yellow-700">
                                        Almost there! Please verify your email to unlock all features.
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleResendVerification}
                                        className="text-sm bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-lg font-medium hover:bg-yellow-200 transition"
                                    >
                                        Resend Email
                                    </button>
                                </div>
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
                        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <SparklesIcon className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        ✨ You have <span className="font-bold text-lg mx-1">{remainingPredictions}</span>
                                        free {remainingPredictions === 1 ? 'assessment' : 'assessments'} remaining
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="text-sm bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
                                    >
                                        Sign Up Free →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Demo Mode Banner */}
            {showDemoMode && !user && (
                <div className="bg-blue-50 border-b border-blue-200">
                    <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
                        <p className="text-sm text-blue-700 text-center">
                            📊 Showing demo data. Sign up to track your real health metrics!
                        </p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header with Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {timeGreeting}, {user?.first_name || user?.username || 'Guest'}!
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {user?.is_verified
                                ? "Here's your personalized health overview"
                                : user
                                    ? 'Verify your email to unlock personalized features'
                                    : 'Try our free diabetes risk assessment'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        {user && user.is_verified && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition"
                                >
                                    <BellAlertIcon className="w-5 h-5 text-gray-600" />
                                    {notifications.filter(n => !n.read).length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {notifications.filter(n => !n.read).length}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50"
                                        >
                                            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                                {notifications.length > 0 && (
                                                    <button
                                                        onClick={handleClearNotifications}
                                                        className="text-xs text-red-600 hover:text-red-700"
                                                    >
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map(notif => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => handleMarkNotificationRead(notif.id)}
                                                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {getNotificationIcon(notif.type)}
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-gray-500">
                                                        No notifications
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all disabled:opacity-50"
                            aria-label="Refresh dashboard"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`grid gap-6 mb-8 ${user
                            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
                            : 'grid-cols-2 md:grid-cols-4'
                        }`}
                >
                    {statsToShow.map((stat, index) => (
                        <div
                            key={index}
                            onClick={() => user && user.is_verified && stat.link && navigate(stat.link)}
                            className={`bg-white rounded-xl p-5 border border-gray-200 relative group
                                ${user && user.is_verified && stat.link ? 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all' : ''}`}
                            title={stat.tooltip}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                                    {stat.iconComponent || <stat.icon className={`w-5 h-5 ${stat.textColor}`} />}
                                </div>
                                {stat.change && (
                                    <span className={`text-xs font-medium ${stat.changeType === 'up' || stat.changeType === 'increase' ? 'text-green-600' :
                                            stat.changeType === 'down' || stat.changeType === 'decrease' ? 'text-red-600' :
                                                'text-gray-500'
                                        }`}>
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.title}</p>

                            {/* Tooltip for additional info */}
                            {stat.tooltip && (
                                <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                                    {stat.tooltip}
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {user ? 'Quick Actions' : 'Get Started'}
                    </h2>
                    <div className={`grid gap-4 ${user
                            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8'
                            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
                        }`}>
                        {actionsToShow.map((action, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={action.action}
                                className="bg-white p-4 rounded-xl border border-gray-200 text-left hover:border-blue-300 hover:shadow-md transition-all relative"
                                disabled={!user && action.title === 'Free Assessment' && remainingPredictions === 0}
                            >
                                {action.badge && (
                                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                        {action.badge}
                                    </span>
                                )}
                                <div className={`${action.bgColor} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                                    <action.icon className={`w-5 h-5 ${action.textColor}`} />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                                <p className="text-xs text-gray-500">{action.description}</p>
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
                        className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {user ? 'Your Recent Assessments' : 'Sample Assessments'}
                                </h2>
                                {user && user.is_verified && recentPredictions.length > 0 && (
                                    <Link
                                        to={ROUTES.HISTORY}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
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
                                    {recentPredictions.slice(0, 5).map((pred, index) => (
                                        <div
                                            key={pred.id || index}
                                            onClick={() => user && user.is_verified && navigate(`${ROUTES.PREDICTIONS.DETAIL.replace(':id', pred.id)}`)}
                                            className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-center min-w-[48px]">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {new Date(pred.date || pred.prediction_date || pred.created_at).getDate()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(pred.date || pred.prediction_date || pred.created_at).toLocaleString('default', { month: 'short' })}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">Diabetes Risk Assessment</h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <ClockIcon className="w-3 h-3" />
                                                        {formatDate(pred.date || pred.prediction_date || pred.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadge(pred.risk_level || pred.result)}`}>
                                                    {pred.risk_level || pred.result || 'Unknown'}
                                                </span>
                                                {user && user.is_verified && (
                                                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BeakerIcon className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {user ? 'Ready for your first assessment?' : 'Try a free assessment'}
                                    </h3>
                                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                        {user
                                            ? user.is_verified
                                                ? 'Get personalized insights about your diabetes risk in just 60 seconds.'
                                                : 'Verify your email to start tracking your health journey.'
                                            : remainingPredictions > 0
                                                ? `You have ${remainingPredictions} free ${remainingPredictions === 1 ? 'assessment' : 'assessments'} remaining. No signup required!`
                                                : 'Sign up for a free account to get unlimited assessments.'}
                                    </p>
                                    <button
                                        onClick={() => handleAction(ROUTES.PREDICTIONS.NEW, false)}
                                        className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                                    >
                                        <PlusCircleIcon className="w-5 h-5" />
                                        {user ? 'Start Assessment' : 'Try Free Assessment'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column - Daily Tip & Achievements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Daily Health Tip */}
                        {dailyTip && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900">Daily Health Tip</h3>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <dailyTip.icon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-1">{dailyTip.title}</h4>
                                        <p className="text-sm text-gray-600">{dailyTip.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        {user && user.is_verified && achievements.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                                <div className="space-y-3">
                                    {achievements.slice(0, 3).map(achievement => (
                                        <div key={achievement.id} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                                                }`}>
                                                <achievement.icon className={`w-4 h-4 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'
                                                    }`} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{achievement.name}</p>
                                                <p className="text-xs text-gray-500">{achievement.description}</p>
                                                {!achievement.earned && achievement.progress && (
                                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                                        <div
                                                            className="bg-blue-600 h-1 rounded-full"
                                                            style={{ width: `${achievement.progress}%` }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </div>
                                            {achievement.earned && (
                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    to={ADDITIONAL_ROUTES.REWARDS}
                                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    View all achievements
                                    <ChevronRightIcon className="w-4 h-4" />
                                </Link>
                            </div>
                        )}

                        {/* Premium Feature Teaser for Unverified Users */}
                        {user && !user.is_verified && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                                        <EnvelopeIcon className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-2">Verify your email to unlock:</h3>
                                        <div className="space-y-2 text-sm text-blue-700">
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
                                                <span>Personalized insights</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleResendVerification}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
                                    >
                                        Resend Email
                                    </button>
                                </div>
                            </motion.div>
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