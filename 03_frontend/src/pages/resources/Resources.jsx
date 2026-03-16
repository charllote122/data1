// src/pages/resources/Resources.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpenIcon,
    HeartIcon,
    AcademicCapIcon,
    BeakerIcon,
    ClockIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    LightBulbIcon,
    DocumentTextIcon,
    SparklesIcon,
    InformationCircleIcon,
    XMarkIcon,
    CheckCircleIcon,
    UserGroupIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import { useResources } from '../../context/ResourcesContext';
import Card from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

// Icon mapping for dynamic icons
const IconMap = {
    HeartIcon,
    BeakerIcon,
    AcademicCapIcon,
    DocumentTextIcon,
    SparklesIcon,
    BookOpenIcon,
    ClockIcon,
    LightBulbIcon,
    InformationCircleIcon,
    UserGroupIcon,
    TrophyIcon
};

const Resources = () => {
    const {
        tips,
        challenges,
        articles,
        loading,
        error,
        rateLimited,
        cooldownSeconds,
        refresh,
        joinChallenge,
        leaveChallenge,
        hasChallenges,
        hasTips,
        hasArticles
    } = useResources();

    const [activeTab, setActiveTab] = useState('tips');
    const [activeCategory, setActiveCategory] = useState('all');
    const [showRateLimitInfo, setShowRateLimitInfo] = useState(true);
    const [joiningId, setJoiningId] = useState(null);

    // Auto-hide rate limit banner after cooldown
    useEffect(() => {
        if (!rateLimited) {
            setShowRateLimitInfo(true);
        }
    }, [rateLimited]);

    // Categories for filtering tips
    const categories = [
        { id: 'all', name: 'All Tips', icon: BookOpenIcon },
        { id: 'wellness', name: 'Wellness', icon: HeartIcon },
        { id: 'nutrition', name: 'Nutrition', icon: AcademicCapIcon },
        { id: 'fitness', name: 'Fitness', icon: BeakerIcon },
        { id: 'diabetes', name: 'Diabetes', icon: DocumentTextIcon },
        { id: 'mental-health', name: 'Mental Health', icon: SparklesIcon },
    ];

    const formatTime = (seconds) => {
        if (!seconds || seconds < 0) return '0s';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    };

    const getCategoryIcon = (category) => {
        const found = categories.find(c => c.id === category);
        return found?.icon || HeartIcon;
    };

    const getCategoryColor = (category) => {
        const colors = {
            wellness: 'blue',
            nutrition: 'green',
            fitness: 'purple',
            diabetes: 'orange',
            'mental-health': 'pink',
            default: 'gray'
        };
        return colors[category] || colors.default;
    };

    const handleJoinChallenge = async (challengeId) => {
        setJoiningId(challengeId);
        const result = await joinChallenge(challengeId);
        setJoiningId(null);

        if (result.success) {
            toast.success('🎉 Successfully joined the challenge!');
        }
    };

    const handleLeaveChallenge = async (challengeId) => {
        if (window.confirm('Are you sure you want to leave this challenge?')) {
            setJoiningId(challengeId);
            const result = await leaveChallenge(challengeId);
            setJoiningId(null);

            if (result.success) {
                toast.success('Left challenge');
            }
        }
    };

    const filteredTips = activeCategory === 'all'
        ? tips
        : tips.filter(tip => tip.category === activeCategory);

    const tabs = [
        { id: 'tips', name: '💡 Health Tips', icon: LightBulbIcon, count: tips.length },
        { id: 'challenges', name: '🏆 Challenges', icon: TrophyIcon, count: challenges.length },
        { id: 'articles', name: '📚 Articles', icon: BookOpenIcon, count: articles.length },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Health Resources</h1>
                        <p className="text-gray-600 mt-2">
                            Tips, challenges, and articles for better health
                        </p>
                    </div>
                    <button
                        onClick={refresh}
                        disabled={loading || rateLimited}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all disabled:opacity-50"
                        title={rateLimited ? `Wait ${formatTime(cooldownSeconds)}` : 'Refresh'}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Rate Limit Banner */}
            {rateLimited && showRateLimitInfo && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg relative"
                >
                    <button
                        onClick={() => setShowRateLimitInfo(false)}
                        className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-800"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                    <div className="flex items-start gap-3 pr-8">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-yellow-800">Taking a Short Break</h4>
                            <p className="text-sm text-yellow-700 mt-1">
                                We've reached our request limit to keep the service fast for everyone.
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="bg-yellow-100 px-3 py-1 rounded-full">
                                    <span className="text-sm font-medium text-yellow-800">
                                        Wait {formatTime(cooldownSeconds)}
                                    </span>
                                </div>
                                <span className="text-xs text-yellow-600">
                                    New content will load automatically
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Error Banner */}
            {error && !rateLimited && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-medium text-red-800">Something went wrong</h4>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <button
                                onClick={refresh}
                                className="mt-2 text-sm text-red-800 underline hover:no-underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-4">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 px-1 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors
                                    ${isActive
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.name}</span>
                                {tab.count > 0 && (
                                    <Badge variant={isActive ? 'primary' : 'default'} size="sm">
                                        {tab.count}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Loading State */}
            {loading && !rateLimited && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && !loading && (
                <div>
                    {/* Category Filter */}
                    {hasTips && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Filter by Category</h2>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => {
                                    const Icon = category.icon;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all
                                                ${activeCategory === category.id
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tips Grid */}
                    {hasTips ? (
                        filteredTips.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTips.map((tip) => {
                                    const Icon = IconMap[tip.icon] || HeartIcon;
                                    const color = tip.color || getCategoryColor(tip.category);

                                    return (
                                        <motion.div
                                            key={tip.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Card className="h-full hover:shadow-lg transition-shadow">
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className={`w-6 h-6 text-${color}-600`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                                                        <p className="text-sm text-gray-600">{tip.content}</p>
                                                        {tip.category && (
                                                            <Badge variant={tip.category} size="sm" className="mt-3">
                                                                {tip.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No tips found for this category</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tips Available</h3>
                            <p className="text-gray-500">Check back later for health tips</p>
                        </div>
                    )}
                </div>
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && !loading && (
                <div>
                    {hasChallenges ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {challenges.map((challenge) => (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <TrophyIcon className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                                                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon className="w-3 h-3" />
                                                        {challenge.duration_days} days
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <UserGroupIcon className="w-3 h-3" />
                                                        {challenge.participants_count || 0} participants
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => challenge.joined
                                                        ? handleLeaveChallenge(challenge.id)
                                                        : handleJoinChallenge(challenge.id)
                                                    }
                                                    disabled={joiningId === challenge.id}
                                                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all
                                                        ${challenge.joined
                                                            ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                                        } disabled:opacity-50`}
                                                >
                                                    {joiningId === challenge.id ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                            Processing...
                                                        </span>
                                                    ) : challenge.joined ? (
                                                        'Leave Challenge'
                                                    ) : (
                                                        'Join Challenge'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Challenges</h3>
                            <p className="text-gray-500">Check back later for new challenges</p>
                        </div>
                    )}
                </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && !loading && (
                <div>
                    {hasArticles ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {articles.map((article) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    {article.read_time && (
                                                        <span className="flex items-center gap-1">
                                                            <ClockIcon className="w-3 h-3" />
                                                            {article.read_time} min read
                                                        </span>
                                                    )}
                                                    {article.author && (
                                                        <span>• {article.author}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Yet</h3>
                            <p className="text-gray-500">Check back later for educational content</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Resources;