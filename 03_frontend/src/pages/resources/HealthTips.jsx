import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    LightBulbIcon,
    HeartIcon,
    BeakerIcon,
    FireIcon,
    ClockIcon,
    BookmarkIcon,
    ShareIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useResources } from '../../hooks/useResources';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';
import toast from 'react-hot-toast';

const HealthTips = () => {
    const { tips, getHealthTips, loading } = useResources();
    const [selectedCategory, setSelectedCategory] = useState('all');
    [bookmarkedTips, setBookmarkedTips] = useState([]);

    useEffect(() => {
        fetchTips();
        loadBookmarks();
    }, []);

    const fetchTips = async () => {
        await getHealthTips();
    };

    const loadBookmarks = () => {
        const saved = localStorage.getItem('bookmarkedTips');
        if (saved) {
            setBookmarkedTips(JSON.parse(saved));
        }
    };

    const categories = [
        { id: 'all', name: 'All Tips', icon: LightBulbIcon },
        { id: 'diet', name: 'Diet & Nutrition', icon: HeartIcon },
        { id: 'exercise', name: 'Exercise', icon: FireIcon },
        { id: 'lifestyle', name: 'Lifestyle', icon: ClockIcon },
        { id: 'medical', name: 'Medical', icon: BeakerIcon },
    ];

    const filteredTips = selectedCategory === 'all'
        ? tips
        : tips.filter(tip => tip.category === selectedCategory);

    const toggleBookmark = (tipId) => {
        let newBookmarks;
        if (bookmarkedTips.includes(tipId)) {
            newBookmarks = bookmarkedTips.filter(id => id !== tipId);
            toast.success('Removed from bookmarks');
        } else {
            newBookmarks = [...bookmarkedTips, tipId];
            toast.success('Added to bookmarks');
        }
        setBookmarkedTips(newBookmarks);
        localStorage.setItem('bookmarkedTips', JSON.stringify(newBookmarks));
    };

    const shareTip = (tip) => {
        if (navigator.share) {
            navigator.share({
                title: tip.title,
                text: tip.content,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(`${tip.title}\n\n${tip.content}`);
            toast.success('Copied to clipboard');
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-3xl font-bold text-gray-900">Health Tips</h1>
                <p className="text-gray-600 mt-2">Practical advice for managing your health</p>
            </motion.div>

            {/* Categories */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap justify-center gap-3"
            >
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all ${selectedCategory === category.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <category.icon className="w-4 h-4" />
                        <span>{category.name}</span>
                    </button>
                ))}
            </motion.div>

            {/* Tips Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredTips.map((tip, index) => (
                    <motion.div
                        key={tip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <Badge variant={tip.category === 'diet' ? 'success' : tip.category === 'exercise' ? 'warning' : 'primary'}>
                                    {categories.find(c => c.id === tip.category)?.name || tip.category}
                                </Badge>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleBookmark(tip.id)}
                                        className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                                    >
                                        <BookmarkIcon className={`w-5 h-5 ${bookmarkedTips.includes(tip.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => shareTip(tip)}
                                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                    >
                                        <ShareIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tip.content}</p>

                            {tip.tags && tip.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {tip.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span className="flex items-center">
                                    <HeartIcon className="w-4 h-4 mr-1" />
                                    {tip.helpful_count || 0} helpful
                                </span>
                                <span className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    {new Date(tip.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <Link
                                to={`/resources/tips/${tip.id}`}
                                className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                                Read more
                                <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Featured Tip */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white"
            >
                <div className="flex items-center space-x-2 mb-4">
                    <LightBulbIcon className="w-6 h-6" />
                    <h2 className="text-xl font-semibold">Tip of the Day</h2>
                </div>
                <p className="text-lg mb-4">
                    "Small changes in your daily routine can lead to significant improvements in your health. Start with one healthy habit and build from there."
                </p>
                <button className="px-6 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Get More Tips
                </button>
            </motion.div>
        </div>
    );
};

export default HealthTips;