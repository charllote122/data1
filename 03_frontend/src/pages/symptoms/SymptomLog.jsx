// src/pages/symptoms/SymptomLog.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSymptoms } from '../../hooks';
import {
    PlusIcon,
    HeartIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    ChartBarIcon,
    ClockIcon,
    FireIcon,
    SparklesIcon,
    DocumentTextIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    CheckCircleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SymptomLog = () => {
    const navigate = useNavigate();
    const { symptoms, loading, error, refresh, deleteSymptom, logSymptom } = useSymptoms();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [showDebug, setShowDebug] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        severe: 0,
        moderate: 0,
        mild: 0,
        averageSeverity: 0,
        mostCommon: '',
    });

    // Debug logging
    useEffect(() => {
        console.log('🔍 SymptomLog mounted');
        console.log('Symptoms from context:', symptoms);
        console.log('Loading:', loading);
        console.log('Error:', error);
        console.log('LocalStorage symptoms:', localStorage.getItem('symptoms'));
    }, [symptoms, loading, error]);

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        if (symptoms.length > 0) {
            calculateStats();
        }
    }, [symptoms]);

    // ============================================
    // Date formatting functions
    // ============================================
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Date not available';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Date error';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '';
        }
    };

    const getRelativeTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';

            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hr ago`;
            if (diffDays < 7) return `${diffDays} day ago`;
            return formatDate(timestamp);
        } catch (error) {
            return '';
        }
    };

    // ============================================
    // Calculate statistics
    // ============================================
    const calculateStats = () => {
        try {
            const severe = symptoms.filter(s => s.severity >= 8).length;
            const moderate = symptoms.filter(s => s.severity >= 5 && s.severity < 8).length;
            const mild = symptoms.filter(s => s.severity < 5).length;

            const avgSeverity = symptoms.reduce((acc, s) => acc + (s.severity || 0), 0) / symptoms.length;

            const symptomCounts = {};
            symptoms.forEach(s => {
                const type = s.symptom_label || s.symptom_type || 'Unknown';
                symptomCounts[type] = (symptomCounts[type] || 0) + 1;
            });

            let mostCommon = 'None';
            let maxCount = 0;
            Object.entries(symptomCounts).forEach(([type, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommon = type;
                }
            });

            setStats({
                total: symptoms.length,
                severe,
                moderate,
                mild,
                averageSeverity: avgSeverity ? avgSeverity.toFixed(1) : '0',
                mostCommon,
            });
        } catch (error) {
            console.error('Error calculating stats:', error);
        }
    };

    // ============================================
    // Delete handler
    // ============================================
    const handleDelete = async () => {
        if (selectedSymptom) {
            try {
                await deleteSymptom(selectedSymptom.id);
                setShowDeleteModal(false);
                setSelectedSymptom(null);
                toast.success('Symptom deleted successfully');
            } catch (error) {
                toast.error('Failed to delete symptom');
            }
        }
    };

    // ============================================
    // Test function to add sample symptom
    // ============================================
    const addSampleSymptom = async () => {
        const sampleSymptoms = [
            { type: 'headache', label: 'Headache', emoji: '🤕', severity: 6 },
            { type: 'fatigue', label: 'Fatigue', emoji: '😴', severity: 7 },
            { type: 'thirst', label: 'Excessive Thirst', emoji: '🥤', severity: 5 },
            { type: 'blurred_vision', label: 'Blurred Vision', emoji: '👓', severity: 8 },
        ];

        const random = sampleSymptoms[Math.floor(Math.random() * sampleSymptoms.length)];

        const testSymptom = {
            symptom_type: random.type,
            symptom_label: random.label,
            emoji: random.emoji,
            severity: random.severity,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            notes: 'Sample symptom for testing',
            duration: 'few_days'
        };

        try {
            await logSymptom(testSymptom);
            toast.success('Sample symptom added!');
        } catch (error) {
            toast.error('Failed to add sample');
        }
    };

    // ============================================
    // UI helper functions
    // ============================================
    const getSeverityColor = (severity) => {
        if (severity >= 8) return 'danger';
        if (severity >= 5) return 'warning';
        return 'success';
    };

    const getSeverityText = (severity) => {
        if (severity >= 8) return 'Severe';
        if (severity >= 5) return 'Moderate';
        return 'Mild';
    };

    const getSeverityIcon = (severity) => {
        if (severity >= 8) return '🚨';
        if (severity >= 5) return '⚠️';
        return '✅';
    };

    // ============================================
    // Filter and sort symptoms
    // ============================================
    const filteredSymptoms = symptoms
        .filter(symptom => {
            if (filter === 'severe' && symptom.severity < 8) return false;
            if (filter === 'moderate' && (symptom.severity < 5 || symptom.severity >= 8)) return false;
            if (filter === 'mild' && symptom.severity >= 5) return false;

            const searchLower = searchTerm.toLowerCase();
            const typeMatch = (symptom.symptom_label || symptom.symptom_type || '').toLowerCase().includes(searchLower);
            const notesMatch = (symptom.notes || '').toLowerCase().includes(searchLower);

            return typeMatch || notesMatch;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return dateB - dateA;
            } else if (sortBy === 'severity') {
                return (b.severity || 0) - (a.severity || 0);
            }
            return 0;
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Symptom Log</h1>
                    <p className="text-gray-600 mt-1">Track and monitor your symptoms over time</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Toggle Debug"
                    >
                        <InformationCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={refresh}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={addSampleSymptom}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Add Sample"
                    >
                        <SparklesIcon className="w-5 h-5" />
                    </button>
                    <Link
                        to="/symptoms/new"
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Log Symptom
                    </Link>
                    <Link
                        to="/health-coach"
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        AI Checker
                    </Link>
                </div>
            </div>

            {/* Debug Panel */}
            <AnimatePresence>
                {showDebug && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <Card className="bg-gray-50 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-700">Debug Information</h3>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('symptoms');
                                        window.location.reload();
                                    }}
                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Clear Storage & Reload
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p><strong>Symptoms count:</strong> {symptoms.length}</p>
                                    <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                                    <p><strong>Error:</strong> {error || 'None'}</p>
                                </div>
                                <div>
                                    <p><strong>Filter:</strong> {filter}</p>
                                    <p><strong>Search:</strong> {searchTerm || 'None'}</p>
                                    <p><strong>Sort by:</strong> {sortBy}</p>
                                </div>
                            </div>
                            {symptoms.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-medium mb-1">Latest symptom:</p>
                                    <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                                        {JSON.stringify(symptoms[0], null, 2)}
                                    </pre>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                    >
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Cards */}
            {symptoms.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
                        <div className="flex items-center justify-between">
                            <ChartBarIcon className="w-5 h-5 text-primary-600" />
                            <span className="text-xs text-primary-600">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-primary-700 mt-2">{stats.total}</p>
                        <p className="text-xs text-primary-600">Symptoms logged</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-50 to-red-100">
                        <div className="flex items-center justify-between">
                            <FireIcon className="w-5 h-5 text-red-600" />
                            <span className="text-xs text-red-600">Severe</span>
                        </div>
                        <p className="text-2xl font-bold text-red-700 mt-2">{stats.severe}</p>
                        <p className="text-xs text-red-600">≥ 8/10 severity</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                        <div className="flex items-center justify-between">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                            <span className="text-xs text-yellow-600">Moderate</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700 mt-2">{stats.moderate}</p>
                        <p className="text-xs text-yellow-600">5-7/10 severity</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center justify-between">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <span className="text-xs text-green-600">Mild</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700 mt-2">{stats.mild}</p>
                        <p className="text-xs text-green-600">{'<'} 5/10 severity</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <div className="flex items-center justify-between">
                            <SparklesIcon className="w-5 h-5 text-purple-600" />
                            <span className="text-xs text-purple-600">Most Common</span>
                        </div>
                        <p className="text-lg font-bold text-purple-700 mt-2 truncate">{stats.mostCommon}</p>
                        <p className="text-xs text-purple-600">Avg severity: {stats.averageSeverity}</p>
                    </Card>
                </div>
            )}

            {/* Filters and Search */}
            {symptoms.length > 0 && (
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search symptoms..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            >
                                <option value="all">All Symptoms</option>
                                <option value="severe">Severe Only</option>
                                <option value="moderate">Moderate Only</option>
                                <option value="mild">Mild Only</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="severity">Sort by Severity</option>
                            </select>
                        </div>
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {symptoms.length === 0 ? (
                <Card className="py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md mx-auto"
                    >
                        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HeartIcon className="w-12 h-12 text-primary-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No symptoms logged yet</h3>
                        <p className="text-gray-500 mb-8">
                            Start tracking your symptoms to identify patterns and share with your healthcare provider.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={addSampleSymptom}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                Add Sample Data
                            </button>
                            <Link
                                to="/symptoms/new"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-lg"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Log Your First Symptom
                            </Link>
                        </div>
                    </motion.div>
                </Card>
            ) : filteredSymptoms.length === 0 ? (
                <Card className="py-12">
                    <div className="text-center">
                        <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No matching symptoms</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilter('all');
                            }}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Clear filters
                        </button>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Showing {filteredSymptoms.length} of {symptoms.length} symptoms
                    </p>

                    {filteredSymptoms.map((symptom, index) => (
                        <motion.div
                            key={symptom.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-all cursor-pointer group"
                                onClick={() => navigate(`/symptoms/${symptom.id}`)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{symptom.emoji || getSeverityIcon(symptom.severity)}</span>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {symptom.symptom_label || symptom.symptom_type || 'Unknown Symptom'}
                                            </h3>
                                            <Badge variant={getSeverityColor(symptom.severity)} size="sm">
                                                {getSeverityText(symptom.severity)} ({symptom.severity || 0}/10)
                                            </Badge>
                                            {symptom.severity >= 8 && (
                                                <Badge variant="danger" size="sm" className="animate-pulse">
                                                    🚨 High Severity
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Date display */}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                {symptom.timestamp ? (
                                                    <>
                                                        {formatDate(symptom.timestamp)}
                                                        {formatTime(symptom.timestamp) && (
                                                            <span className="text-gray-400 ml-1">
                                                                at {formatTime(symptom.timestamp)}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-400 ml-2">
                                                            ({getRelativeTime(symptom.timestamp)})
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">Date not recorded</span>
                                                )}
                                            </div>
                                            {symptom.duration && (
                                                <div className="flex items-center gap-1">
                                                    <ClockIcon className="w-4 h-4" />
                                                    Duration: {symptom.duration.replace('_', ' ')}
                                                </div>
                                            )}
                                        </div>

                                        {symptom.notes && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-sm text-gray-700">{symptom.notes}</p>
                                            </div>
                                        )}

                                        {symptom.severity >= 8 && (
                                            <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2">
                                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-700">
                                                    High severity symptom detected. Consider consulting a healthcare provider immediately.
                                                </p>
                                            </div>
                                        )}

                                        {/* AI Analysis Link */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <Link
                                                to="/health-coach"
                                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <SparklesIcon className="w-3 h-3" />
                                                Get AI analysis for this symptom
                                            </Link>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSymptom(symptom);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && selectedSymptom && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setSelectedSymptom(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Symptom Log</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete "{selectedSymptom.symptom_label || selectedSymptom.symptom_type}"?
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedSymptom(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SymptomLog;