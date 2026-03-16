// src/pages/medications/MedicationList.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedications } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CalendarIcon,
    BeakerIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MedicationList = () => {
    const navigate = useNavigate();
    const { medications, loading, error, refresh, deleteMedication, updateMedication } = useMedications();
    const { user } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
    });

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        if (medications.length > 0) {
            calculateStats();
        }
    }, [medications]);

    const calculateStats = () => {
        const active = medications.filter(m => m.is_active).length;
        setStats({
            total: medications.length,
            active,
            inactive: medications.length - active,
        });
    };

    const handleDelete = async () => {
        if (selectedMedication) {
            try {
                await deleteMedication(selectedMedication.id);
                setShowDeleteModal(false);
                setSelectedMedication(null);
                toast.success('Medication deleted successfully');
            } catch (error) {
                toast.error('Failed to delete medication');
            }
        }
    };

    const toggleActive = async (medication) => {
        try {
            await updateMedication(medication.id, {
                ...medication,
                is_active: !medication.is_active
            });
            toast.success(`Medication ${medication.is_active ? 'deactivated' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update medication');
        }
    };

    const filteredMedications = medications
        .filter(med => {
            if (filter === 'active') return med.is_active;
            if (filter === 'inactive') return !med.is_active;
            return true;
        })
        .filter(med => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return med.name?.toLowerCase().includes(search) ||
                med.dosage?.toLowerCase().includes(search) ||
                med.notes?.toLowerCase().includes(search);
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'date') return new Date(b.start_date) - new Date(a.start_date);
            if (sortBy === 'status') return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
            return 0;
        });

    const getFrequencyLabel = (frequency) => {
        const labels = {
            daily: 'Once daily',
            twice_daily: 'Twice daily',
            three_times: 'Three times daily',
            four_times: 'Four times daily',
            weekly: 'Once weekly',
            monthly: 'Once monthly',
            as_needed: 'As needed'
        };
        return labels[frequency] || frequency;
    };

    if (loading && medications.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
                    <p className="text-gray-600 mt-1">Track and manage your medications</p>
                    {user && (
                        <p className="text-sm text-primary-600 mt-1">
                            Logged in as: {user.email}
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={refresh}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <Link
                        to="/medications/calendar"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <CalendarIcon className="w-5 h-5" />
                        Calendar
                    </Link>
                    <Link
                        to="/medications/new"
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-lg"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Medication
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            {medications.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-primary-50 to-primary-100">
                        <div className="flex items-center justify-between">
                            <BeakerIcon className="w-5 h-5 text-primary-600" />
                            <span className="text-xs text-primary-600">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-primary-700 mt-2">{stats.total}</p>
                        <p className="text-xs text-primary-600">Medications</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <div className="flex items-center justify-between">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <span className="text-xs text-green-600">Active</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700 mt-2">{stats.active}</p>
                        <p className="text-xs text-green-600">Current medications</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="flex items-center justify-between">
                            <XCircleIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-xs text-gray-600">Inactive</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-700 mt-2">{stats.inactive}</p>
                        <p className="text-xs text-gray-600">Past medications</p>
                    </Card>
                </div>
            )}

            {/* Filters and Search */}
            {medications.length > 0 && (
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search medications..."
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            />
                        </div>

                        <div className="flex gap-2">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            >
                                <option value="all">All Medications</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="date">Sort by Start Date</option>
                                <option value="status">Sort by Status</option>
                            </select>
                        </div>
                    </div>
                </Card>
            )}

            {/* Error Message from Context */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {filteredMedications.length === 0 ? (
                <Card className="py-16">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {searchTerm || filter !== 'all' ? (
                                <ClockIcon className="w-10 h-10 text-gray-400" />
                            ) : (
                                <BeakerIcon className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchTerm || filter !== 'all'
                                ? 'No matching medications'
                                : 'No medications found'
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm || filter !== 'all'
                                ? 'Try adjusting your filters or search term'
                                : 'Start by adding your first medication'
                            }
                        </p>
                        {!searchTerm && filter === 'all' && medications.length === 0 && (
                            <Link
                                to="/medications/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-lg"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add Medication
                            </Link>
                        )}
                        {(searchTerm || filter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilter('all');
                                }}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMedications.map((medication, index) => (
                        <motion.div
                            key={medication.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-all group relative overflow-hidden">
                                {/* Status indicator line */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${medication.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />

                                <div className="pl-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                                            <p className="text-sm text-gray-600">{medication.dosage}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => toggleActive(medication)}
                                                className={`p-1.5 rounded-lg transition-colors ${medication.is_active
                                                    ? 'text-green-600 hover:bg-green-50'
                                                    : 'text-gray-400 hover:bg-gray-100'
                                                    }`}
                                                title={medication.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {medication.is_active ? (
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                ) : (
                                                    <XCircleIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                            <Link
                                                to={`/medications/${medication.id}/edit`}
                                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setSelectedMedication(medication);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <ClockIcon className="w-4 h-4" />
                                            <span className="capitalize">{getFrequencyLabel(medication.frequency)}</span>
                                        </div>

                                        {medication.reminder_times?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {medication.reminder_times.map((time, idx) => (
                                                    <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                                                        {time}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500">
                                            <p>Started: {new Date(medication.start_date).toLocaleDateString()}</p>
                                            {medication.end_date && (
                                                <p>Ends: {new Date(medication.end_date).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    </div>

                                    {medication.notes && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-sm text-gray-600">📝 {medication.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && selectedMedication && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setSelectedMedication(null);
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
                                <TrashIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Medication</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete <span className="font-semibold">{selectedMedication.name}</span>?
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
                                        setSelectedMedication(null);
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

export default MedicationList;