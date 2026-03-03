import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    DocumentTextIcon,
    ClockIcon,
    UserIcon,
    BookmarkIcon,
    ShareIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useResources } from '../../hooks/useResources';
import Loader from '../../components/Loader';
import Badge from '../../components/Badge';

const Articles = () => {
    const { articles, getArticles, loading } = useResources();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [bookmarkedArticles, setBookmarkedArticles] = useState([]);

    useEffect(() => {
        fetchArticles();
        loadBookmarks();
    }, []);

    const fetchArticles = async () => {
        await getArticles();
    };

    const loadBookmarks = () => {
        const saved = localStorage.getItem('bookmarkedArticles');
        if (saved) {
            setBookmarkedArticles(JSON.parse(saved));
        }
    };

    const categories = [
        { id: 'all', name: 'All Articles' },
        { id: 'research', name: 'Research' },
        { id: 'lifestyle', name: 'Lifestyle' },
        { id: 'nutrition', name: 'Nutrition' },
        { id: 'exercise', name: 'Exercise' },
        { id: 'mental-health', name: 'Mental Health' },
    ];

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleBookmark = (articleId) => {
        let newBookmarks;
        if (bookmarkedArticles.includes(articleId)) {
            newBookmarks = bookmarkedArticles.filter(id => id !== articleId);
        } else {
            newBookmarks = [...bookmarkedArticles, articleId];
        }
        setBookmarkedArticles(newBookmarks);
        localStorage.setItem('bookmarkedArticles', JSON.stringify(newBookmarks));
    };

    const shareArticle = (article) => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: `${window.location.origin}/resources/articles/${article.id}`,
            });
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
                <h1 className="text-3xl font-bold text-gray-900">Health Articles</h1>
                <p className="text-gray-600 mt-2">Latest research and insights for better health</p>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="input-field md:w-48"
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Featured Article */}
            {filteredArticles.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl overflow-hidden"
                >
                    <div className="md:flex">
                        <div className="md:w-1/3 h-48 md:h-auto bg-cover bg-center"
                            style={{ backgroundImage: `url(${filteredArticles[0].image})` }} />
                        <div className="p-8 md:w-2/3 text-white">
                            <Badge variant="primary" className="mb-4">{filteredArticles[0].category}</Badge>
                            <h2 className="text-2xl font-bold mb-2">{filteredArticles[0].title}</h2>
                            <p className="text-purple-100 mb-4">{filteredArticles[0].excerpt}</p>
                            <div className="flex items-center space-x-4 text-sm text-purple-200 mb-4">
                                <span className="flex items-center">
                                    <UserIcon className="w-4 h-4 mr-1" />
                                    {filteredArticles[0].author}
                                </span>
                                <span className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    {filteredArticles[0].readTime} min read
                                </span>
                            </div>
                            <Link
                                to={`/resources/articles/${filteredArticles[0].id}`}
                                className="inline-flex items-center px-6 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Read Article
                                <ChevronRightIcon className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Articles Grid */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredArticles.slice(1).map((article, index) => (
                    <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                    >
                        {article.image && (
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <Badge variant="primary" size="sm">{article.category}</Badge>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleBookmark(article.id)}
                                        className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                                    >
                                        <BookmarkIcon className={`w-4 h-4 ${bookmarkedArticles.includes(article.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                    </button>
                                    <button
                                        onClick={() => shareArticle(article)}
                                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                    >
                                        <ShareIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span className="flex items-center">
                                    <UserIcon className="w-4 h-4 mr-1" />
                                    {article.author}
                                </span>
                                <span className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    {article.readTime} min
                                </span>
                            </div>

                            <Link
                                to={`/resources/articles/${article.id}`}
                                className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                                Read more
                                <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Load More */}
            {filteredArticles.length > 6 && (
                <div className="text-center">
                    <button className="btn-secondary px-8">
                        Load More Articles
                    </button>
                </div>
            )}
        </div>
    );
};

export default Articles;