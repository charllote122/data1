import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LightBulbIcon,
    HeartIcon,
    AcademicCapIcon,
    ClockIcon,
    ArrowPathIcon,
    SparklesIcon,
    BookmarkIcon,
    ShareIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    FireIcon,
    BeakerIcon,
    MoonIcon,
    SunIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const HealthTips = ({ tips = [], onSave, onShare, onTipClick, showCategories = true, allowSharing = true }) => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [savedTips, setSavedTips] = useState([]);
    const [expandedTip, setExpandedTip] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [animateTip, setAnimateTip] = useState(false);

    // Extract unique categories from tips
    const categories = ['all', ...new Set(tips.map(tip => tip.category).filter(Boolean))];

    // Filter tips by category
    const filteredTips = categoryFilter === 'all'
        ? tips
        : tips.filter(tip => tip.category === categoryFilter);

    // Get current tip
    const currentTip = filteredTips[currentTipIndex];

    // Load saved tips from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('saved_health_tips');
        if (saved) {
            setSavedTips(JSON.parse(saved));
        }
    }, []);

    // Handle next tip
    const nextTip = () => {
        if (filteredTips.length === 0) return;
        setAnimateTip(true);
        setTimeout(() => {
            setCurrentTipIndex((prev) => (prev + 1) % filteredTips.length);
            setAnimateTip(false);
        }, 300);
    };

    // Handle previous tip
    const prevTip = () => {
        if (filteredTips.length === 0) return;
        setAnimateTip(true);
        setTimeout(() => {
            setCurrentTipIndex((prev) => (prev - 1 + filteredTips.length) % filteredTips.length);
            setAnimateTip(false);
        }, 300);
    };

    // Handle saving a tip
    const handleSaveTip = (tip) => {
        const isSaved = savedTips.some(t => t.id === tip.id || t.title === tip.title);
        let newSavedTips;

        if (isSaved) {
            newSavedTips = savedTips.filter(t => t.id !== tip.id && t.title !== tip.title);
        } else {
            newSavedTips = [...savedTips, { ...tip, savedAt: new Date().toISOString() }];
        }

        setSavedTips(newSavedTips);
        localStorage.setItem('saved_health_tips', JSON.stringify(newSavedTips));

        if (onSave) {
            onSave(tip, !isSaved);
        }
    };

    // Handle sharing a tip
    const handleShareTip = async (tip) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: tip.title,
                    text: tip.content,
                    url: window.location.href,
                });
                if (onShare) onShare(tip);
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(`${tip.title}\n\n${tip.content}`);
            alert('Tip copied to clipboard!');
        }
    };

    // Handle tip click
    const handleTipClick = (tip) => {
        setExpandedTip(expandedTip === tip.id ? null : tip.id);
        if (onTipClick) onTipClick(tip);
    };

    // Get category icon
    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case 'nutrition':
                return <BeakerIcon className="w-4 h-4" />;
            case 'exercise':
                return <FireIcon className="w-4 h-4" />;
            case 'sleep':
                return <MoonIcon className="w-4 h-4" />;
            case 'mental health':
                return <HeartIcon className="w-4 h-4" />;
            case 'prevention':
                return <ShieldCheckIcon className="w-4 h-4" />;
            default:
                return <LightBulbIcon className="w-4 h-4" />;
        }
    };

    // Get category color
    const getCategoryColor = (category) => {
        switch (category?.toLowerCase()) {
            case 'nutrition':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            case 'exercise':
                return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            case 'sleep':
                return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
            case 'mental health':
                return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
            case 'prevention':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    if (!tips || tips.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col items-center justify-center"
            >
                <LightBulbIcon className="w-12 h-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Health Tips</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Check back later for personalized health recommendations
                </p>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                            <LightBulbIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Tips</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {filteredTips.length} {filteredTips.length === 1 ? 'tip' : 'tips'} available
                            </p>
                        </div>
                    </div>

                    {/* Bookmarks Toggle */}
                    {savedTips.length > 0 && (
                        <button
                            onClick={() => setShowBookmarks(!showBookmarks)}
                            className={`p-2 rounded-lg transition-colors ${showBookmarks
                                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                            title={showBookmarks ? 'Show all tips' : 'Show bookmarks'}
                        >
                            <BookmarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Category Filter */}
                {showCategories && categories.length > 1 && !showBookmarks && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setCategoryFilter(category);
                                    setCurrentTipIndex(0);
                                }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors capitalize
                                    ${categoryFilter === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {category === 'all' ? 'All' : category}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Tips Content */}
            <div className="flex-1 p-5 overflow-y-auto">
                {showBookmarks && savedTips.length > 0 ? (
                    // Saved Tips View
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                            <BookmarkIcon className="w-4 h-4" />
                            Saved Tips ({savedTips.length})
                        </h3>
                        <AnimatePresence>
                            {savedTips.map((tip, index) => (
                                <motion.div
                                    key={tip.id || tip.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => handleTipClick(tip)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm flex-1">
                                            {tip.title}
                                        </h4>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveTip(tip);
                                            }}
                                            className="text-yellow-600 hover:text-yellow-700"
                                        >
                                            <HeartIconSolid className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {tip.content}
                                    </p>
                                    {tip.savedAt && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Saved {new Date(tip.savedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    // Carousel View
                    filteredTips.length > 0 && (
                        <div className="relative">
                            {/* Tip Card */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTipIndex}
                                    initial={{ opacity: 0, x: animateTip ? 20 : 0 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 cursor-pointer"
                                    onClick={() => handleTipClick(currentTip)}
                                >
                                    {/* Tip Header */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(currentTip.category)}`}>
                                                {getCategoryIcon(currentTip.category)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {currentTip.title}
                                                </h3>
                                                {currentTip.category && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {currentTip.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveTip(currentTip);
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${savedTips.some(t => t.id === currentTip.id || t.title === currentTip.title)
                                                        ? 'text-yellow-600 hover:text-yellow-700'
                                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                                    }`}
                                                title={savedTips.some(t => t.id === currentTip.id || t.title === currentTip.title) ? 'Remove bookmark' : 'Bookmark tip'}
                                            >
                                                {savedTips.some(t => t.id === currentTip.id || t.title === currentTip.title) ? (
                                                    <HeartIconSolid className="w-5 h-5" />
                                                ) : (
                                                    <BookmarkIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                            {allowSharing && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShareTip(currentTip);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                                                    title="Share tip"
                                                >
                                                    <ShareIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tip Content */}
                                    <div className="space-y-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {currentTip.content}
                                        </p>

                                        {/* Expanded Content */}
                                        <AnimatePresence>
                                            {expandedTip === currentTip.id && currentTip.details && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                                                            More Details
                                                        </h4>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {currentTip.details}
                                                        </p>

                                                        {/* Sources */}
                                                        {currentTip.source && (
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                                                                <a
                                                                    href={currentTip.source}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    Learn more
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Tip Footer */}
                                        <div className="flex items-center justify-between pt-2">
                                            {currentTip.relevance && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                    <SparklesIcon className="w-3 h-3" />
                                                    <span>{currentTip.relevance}</span>
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleTipClick(currentTip);
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                            >
                                                {expandedTip === currentTip.id ? 'Show less' : 'Read more'}
                                                {expandedTip === currentTip.id ? '↑' : '↓'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Controls */}
                            {filteredTips.length > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={prevTip}
                                            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            aria-label="Previous tip"
                                        >
                                            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                        <button
                                            onClick={nextTip}
                                            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            aria-label="Next tip"
                                        >
                                            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </button>
                                    </div>

                                    {/* Tip Counter */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {filteredTips.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentTipIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-all ${index === currentTipIndex
                                                            ? 'w-6 bg-blue-600'
                                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                                        }`}
                                                    aria-label={`Go to tip ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            {currentTipIndex + 1}/{filteredTips.length}
                                        </span>
                                    </div>

                                    {/* Refresh Random */}
                                    <button
                                        onClick={() => setCurrentTipIndex(Math.floor(Math.random() * filteredTips.length))}
                                        className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        aria-label="Random tip"
                                    >
                                        <ArrowPathIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>Tips based on CDC guidelines</span>
                    </div>
                    {!showBookmarks && (
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span>Daily tip #{currentTipIndex + 1}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

HealthTips.defaultProps = {
    tips: [],
    showCategories: true,
    allowSharing: true,
    onSave: null,
    onShare: null,
    onTipClick: null
};

export default HealthTips;