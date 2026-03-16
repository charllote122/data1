// src/pages/health-coach/MedicationTracker.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BeakerIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CalendarIcon,
    BellIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    HeartIcon,
    SparklesIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useHealth } from '../../context/HealthContext';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const MedicationTracker = () => {
    const navigate = useNavigate();
    const { profile } = useHealth();
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMedication, setEditingMedication] = useState(null);
    const [filter, setFilter] = useState('all'); // all, active, completed, expired
    const [stats, setStats] = useState({
        total: 0,
        takenToday: 0,
        missedToday: 0,
        upcoming: 0,
        adherence: 0,
    });
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        dosageUnit: 'mg',
        frequency: 'daily',
        times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        notes: '',
        reminders: true,
        refillReminder: false,
        refillDate: '',
        quantity: 30,
        remaining: 30,
        instructions: '',
        prescribedBy: '',
        pharmacy: '',
        pharmacyPhone: '',
    });

    useEffect(() => {
        fetchMedications();
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        calculateStats();
    }, [medications]);

    const fetchMedications = async () => {
        try {
            setLoading(true);
            // Mock data - replace with actual API call
            const mockMedications = [
                {
                    id: 1,
                    name: 'Metformin',
                    dosage: 500,
                    dosageUnit: 'mg',
                    frequency: 'twice_daily',
                    times: ['08:00', '20:00'],
                    startDate: '2024-01-01',
                    endDate: null,
                    notes: 'Take with meals to reduce stomach upset',
                    reminders: true,
                    refillReminder: true,
                    refillDate: '2024-03-15',
                    quantity: 60,
                    remaining: 45,
                    instructions: 'Take with food',
                    prescribedBy: 'Dr. Smith',
                    pharmacy: 'CVS Pharmacy',
                    pharmacyPhone: '(555) 123-4567',
                    taken: [
                        { date: new Date().toDateString(), time: '08:00', taken: true },
                        { date: new Date().toDateString(), time: '20:00', taken: false },
                    ],
                    history: [
                        { date: '2024-03-04', taken: true },
                        { date: '2024-03-03', taken: true },
                        { date: '2024-03-02', taken: false },
                    ],
                    color: 'blue',
                },
                {
                    id: 2,
                    name: 'Lisinopril',
                    dosage: 10,
                    dosageUnit: 'mg',
                    frequency: 'daily',
                    times: ['09:00'],
                    startDate: '2024-01-15',
                    endDate: null,
                    notes: 'Blood pressure medication',
                    reminders: true,
                    refillReminder: true,
                    refillDate: '2024-03-20',
                    quantity: 30,
                    remaining: 12,
                    instructions: 'Take at same time daily',
                    prescribedBy: 'Dr. Johnson',
                    pharmacy: 'Walgreens',
                    pharmacyPhone: '(555) 987-6543',
                    taken: [
                        { date: new Date().toDateString(), time: '09:00', taken: true },
                    ],
                    history: [
                        { date: '2024-03-04', taken: true },
                        { date: '2024-03-03', taken: true },
                        { date: '2024-03-02', taken: true },
                    ],
                    color: 'green',
                },
                {
                    id: 3,
                    name: 'Aspirin',
                    dosage: 81,
                    dosageUnit: 'mg',
                    frequency: 'daily',
                    times: ['08:00'],
                    startDate: '2024-02-01',
                    endDate: '2024-03-01',
                    notes: 'Low dose aspirin',
                    reminders: false,
                    refillReminder: false,
                    quantity: 30,
                    remaining: 0,
                    instructions: '',
                    prescribedBy: 'Dr. Smith',
                    pharmacy: 'CVS Pharmacy',
                    pharmacyPhone: '(555) 123-4567',
                    taken: [],
                    history: [
                        { date: '2024-02-29', taken: true },
                        { date: '2024-02-28', taken: true },
                    ],
                    color: 'red',
                },
            ];
            setMedications(mockMedications);
        } catch (error) {
            toast.error('Failed to load medications');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const today = new Date().toDateString();
        let takenToday = 0;
        let missedToday = 0;
        let upcoming = 0;
        let totalDoses = 0;
        let takenDoses = 0;

        medications.forEach(med => {
            // Count today's doses
            const todayDoses = med.taken?.filter(t => t.date === today) || [];
            takenToday += todayDoses.filter(t => t.taken).length;
            missedToday += todayDoses.filter(t => !t.taken).length;

            // Count upcoming doses
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            med.times.forEach(time => {
                const [hours, minutes] = time.split(':').map(Number);
                const doseTime = hours * 60 + minutes;
                if (doseTime > currentTime) {
                    upcoming++;
                }
            });

            // Calculate adherence (last 7 days)
            const last7Days = med.history?.slice(-7) || [];
            totalDoses += last7Days.length;
            takenDoses += last7Days.filter(d => d.taken).length;
        });

        setStats({
            total: medications.length,
            takenToday,
            missedToday,
            upcoming,
            adherence: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0,
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...formData.times];
        newTimes[index] = value;
        setFormData(prev => ({ ...prev, times: newTimes }));
    };

    const addTime = () => {
        setFormData(prev => ({
            ...prev,
            times: [...prev.times, '12:00'],
        }));
    };

    const removeTime = (index) => {
        if (formData.times.length > 1) {
            setFormData(prev => ({
                ...prev,
                times: prev.times.filter((_, i) => i !== index),
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.dosage || !formData.times.length) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingMedication) {
                // Update existing medication
                setMedications(prev =>
                    prev.map(med =>
                        med.id === editingMedication.id
                            ? {
                                ...med,
                                ...formData,
                                dosage: parseFloat(formData.dosage),
                                quantity: parseInt(formData.quantity),
                                remaining: parseInt(formData.remaining),
                            }
                            : med
                    )
                );
                toast.success('Medication updated successfully');

                // Schedule notification if enabled
                if (formData.reminders) {
                    scheduleNotifications(formData);
                }
            } else {
                // Add new medication
                const newMedication = {
                    id: medications.length + 1,
                    ...formData,
                    dosage: parseFloat(formData.dosage),
                    quantity: parseInt(formData.quantity),
                    remaining: parseInt(formData.remaining || formData.quantity),
                    taken: [],
                    history: [],
                    color: getRandomColor(),
                };
                setMedications(prev => [...prev, newMedication]);
                toast.success('Medication added successfully');

                // Schedule notifications
                if (formData.reminders) {
                    scheduleNotifications(formData);
                }
            }
            setShowAddModal(false);
            setEditingMedication(null);
            resetForm();
        } catch (error) {
            toast.error('Failed to save medication');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medication?')) {
            try {
                setMedications(prev => prev.filter(med => med.id !== id));
                toast.success('Medication deleted successfully');

                // Cancel notifications (would need actual implementation)
                cancelNotifications(id);
            } catch (error) {
                toast.error('Failed to delete medication');
            }
        }
    };

    const handleTakeMedication = (medicationId, time) => {
        setMedications(prev =>
            prev.map(med => {
                if (med.id === medicationId) {
                    const today = new Date().toDateString();

                    // Update taken status
                    const updatedTaken = [...(med.taken || [])];
                    const existingIndex = updatedTaken.findIndex(t => t.date === today && t.time === time);

                    if (existingIndex >= 0) {
                        updatedTaken[existingIndex].taken = true;
                    } else {
                        updatedTaken.push({ date: today, time, taken: true });
                    }

                    // Update history
                    const updatedHistory = [...(med.history || [])];
                    const todayHistory = updatedHistory.find(h => h.date === today);
                    if (todayHistory) {
                        todayHistory.taken = true;
                    } else {
                        updatedHistory.push({ date: today, taken: true });
                    }

                    // Decrease remaining count
                    const newRemaining = Math.max(0, med.remaining - 1);

                    return {
                        ...med,
                        taken: updatedTaken,
                        history: updatedHistory,
                        remaining: newRemaining,
                    };
                }
                return med;
            })
        );

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Medication Taken', {
                body: `Great job! Keep up the good work.`,
                icon: '/icon.png',
            });
        }

        toast.success('Medication logged!', {
            icon: '✅',
            duration: 2000,
        });
    };

    const handleRefillReminder = (medication) => {
        if (medication.remaining <= 7) {
            toast((t) => (
                <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                    <div>
                        <p className="font-medium text-gray-900">Low on {medication.name}</p>
                        <p className="text-sm text-gray-600">
                            Only {medication.remaining} doses remaining. Time to refill!
                        </p>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                window.open(`tel:${medication.pharmacyPhone}`);
                            }}
                            className="mt-2 text-sm bg-primary-600 text-white px-3 py-1 rounded-lg"
                        >
                            Call Pharmacy
                        </button>
                    </div>
                </div>
            ), { duration: 10000 });
        }
    };

    const scheduleNotifications = (medication) => {
        // In a real app, this would schedule push notifications
        console.log('Scheduling notifications for:', medication.name);

        if ('Notification' in window && Notification.permission === 'granted') {
            medication.times.forEach(time => {
                // This is simplified - would need actual scheduling logic
                setTimeout(() => {
                    new Notification(`Time for ${medication.name}`, {
                        body: `${medication.dosage}${medication.dosageUnit} - ${medication.instructions || 'Take as prescribed'}`,
                        icon: '/icon.png',
                        tag: `med-${medication.id}-${time}`,
                    });
                }, 5000); // Demo: show after 5 seconds
            });
        }
    };

    const cancelNotifications = (medicationId) => {
        // In a real app, this would cancel scheduled notifications
        console.log('Cancelling notifications for medication:', medicationId);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            dosage: '',
            dosageUnit: 'mg',
            frequency: 'daily',
            times: ['08:00'],
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            notes: '',
            reminders: true,
            refillReminder: false,
            refillDate: '',
            quantity: 30,
            remaining: 30,
            instructions: '',
            prescribedBy: '',
            pharmacy: '',
            pharmacyPhone: '',
        });
    };

    const getRandomColor = () => {
        const colors = ['blue', 'green', 'purple', 'orange', 'pink', 'indigo'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const getFrequencyLabel = (frequency) => {
        const labels = {
            daily: 'Once daily',
            twice_daily: 'Twice daily',
            three_times: 'Three times daily',
            four_times: 'Four times daily',
            weekly: 'Weekly',
            monthly: 'Monthly',
            as_needed: 'As needed',
        };
        return labels[frequency] || frequency;
    };

    const isMedicationActive = (medication) => {
        const today = new Date();
        const startDate = new Date(medication.startDate);
        const endDate = medication.endDate ? new Date(medication.endDate) : null;

        return startDate <= today && (!endDate || endDate >= today);
    };

    const getTodayTakenCount = (medication) => {
        const today = new Date().toDateString();
        return medication.taken?.filter(t => t.date === today && t.taken).length || 0;
    };

    const getTodayDoses = (medication) => {
        return medication.times.length;
    };

    const getAdherenceColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const filteredMedications = medications.filter(med => {
        if (filter === 'active') return isMedicationActive(med);
        if (filter === 'completed') {
            const today = new Date().toDateString();
            return getTodayTakenCount(med) >= getTodayDoses(med);
        }
        if (filter === 'expired') return !isMedicationActive(med) && med.endDate;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <ArrowPathIcon className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Medication Tracker</h2>
                    <p className="text-sm text-gray-600">Manage and track your medications</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition ${filter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-3 py-1.5 text-sm rounded-lg transition ${filter === 'active'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Medication</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <BeakerIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-blue-600">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 mt-2">{stats.total}</p>
                    <p className="text-xs text-blue-600">Active medications</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="text-xs text-green-600">Today</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700 mt-2">{stats.takenToday}</p>
                    <p className="text-xs text-green-600">Doses taken</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                        <span className="text-xs text-red-600">Missed</span>
                    </div>
                    <p className="text-2xl font-bold text-red-700 mt-2">{stats.missedToday}</p>
                    <p className="text-xs text-red-600">Doses missed</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <ClockIcon className="w-5 h-5 text-purple-600" />
                        <span className="text-xs text-purple-600">Upcoming</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700 mt-2">{stats.upcoming}</p>
                    <p className="text-xs text-purple-600">Doses remaining</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <HeartIcon className="w-5 h-5 text-orange-600" />
                        <span className="text-xs text-orange-600">Adherence</span>
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${getAdherenceColor(stats.adherence)}`}>
                        {stats.adherence}%
                    </p>
                    <p className="text-xs text-orange-600">Last 7 days</p>
                </div>
            </div>

            {/* Profile Warning for New Users */}
            {!profile && medications.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <SparklesIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-yellow-800 font-medium">
                                    Complete your health profile for personalized medication recommendations
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    Your health conditions help us provide better medication guidance
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(ROUTES.PROFILE)}
                            className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                        >
                            Update Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Medications List */}
            <div className="space-y-4">
                {filteredMedications.length > 0 ? (
                    filteredMedications.map((medication, index) => (
                        <motion.div
                            key={medication.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-white rounded-xl shadow-soft p-4 border ${isMedicationActive(medication)
                                    ? 'border-green-200'
                                    : 'border-gray-200 opacity-75'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-lg bg-${medication.color}-100`}>
                                        <BeakerIcon className={`w-5 h-5 text-${medication.color}-600`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                                            {!isMedicationActive(medication) && (
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                                    Expired
                                                </span>
                                            )}
                                            {medication.remaining <= 7 && medication.remaining > 0 && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                    Low Stock
                                                </span>
                                            )}
                                            {medication.remaining === 0 && (
                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                                    Refill Needed
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {medication.dosage}{medication.dosageUnit} • {getFrequencyLabel(medication.frequency)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setEditingMedication(medication);
                                            setFormData({
                                                ...medication,
                                                dosage: medication.dosage.toString(),
                                                quantity: medication.quantity.toString(),
                                                remaining: medication.remaining.toString(),
                                            });
                                            setShowAddModal(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                        title="Edit"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(medication.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Times Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                {medication.times.map((time, i) => {
                                    const today = new Date().toDateString();
                                    const taken = medication.taken?.some(
                                        t => t.date === today && t.time === time && t.taken
                                    );
                                    const isPastTime = () => {
                                        const [hours, minutes] = time.split(':').map(Number);
                                        const doseTime = new Date().setHours(hours, minutes, 0, 0);
                                        return doseTime < Date.now();
                                    };

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => !taken && handleTakeMedication(medication.id, time)}
                                            disabled={taken || !isMedicationActive(medication)}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition ${taken
                                                    ? 'bg-green-50 border-green-200 cursor-default'
                                                    : isPastTime() && !taken
                                                        ? 'bg-red-50 border-red-200 hover:bg-red-100'
                                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                } ${!isMedicationActive(medication) ? 'opacity-50' : ''
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{time}</span>
                                            {taken ? (
                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                            ) : isPastTime() ? (
                                                <XCircleIcon className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <ClockIcon className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                {medication.instructions && (
                                    <div className="flex items-start space-x-2 text-gray-600">
                                        <DocumentTextIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{medication.instructions}</span>
                                    </div>
                                )}

                                {medication.prescribedBy && (
                                    <div className="flex items-start space-x-2 text-gray-600">
                                        <HeartIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>Dr. {medication.prescribedBy}</span>
                                    </div>
                                )}

                                <div className="flex items-start space-x-2 text-gray-600">
                                    <CalendarIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Started: {new Date(medication.startDate).toLocaleDateString()}
                                        {medication.endDate && ` • Until: ${new Date(medication.endDate).toLocaleDateString()}`}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar for Refills */}
                            {medication.quantity > 0 && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                        <span>Refill Progress</span>
                                        <span>{medication.remaining} / {medication.quantity} remaining</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${(medication.remaining / medication.quantity) > 0.7
                                                    ? 'bg-green-500'
                                                    : (medication.remaining / medication.quantity) > 0.3
                                                        ? 'bg-yellow-500'
                                                        : 'bg-red-500'
                                                }`}
                                            style={{ width: `${(medication.remaining / medication.quantity) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Pharmacy Info */}
                            {medication.pharmacy && (
                                <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">{medication.pharmacy}</span>
                                        {medication.pharmacyPhone && (
                                            <a
                                                href={`tel:${medication.pharmacyPhone}`}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Call
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {medication.notes && (
                                <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                                    <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                                    {medication.notes}
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <BeakerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No medications found</p>
                        <p className="text-sm text-gray-400 mb-4">
                            {filter !== 'all' ? 'Try changing your filter' : 'Add your first medication to get started'}
                        </p>
                        {filter !== 'all' ? (
                            <button
                                onClick={() => setFilter('all')}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear filters
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-primary"
                            >
                                Add Medication
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-soft max-w-2xl w-full p-6 my-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {editingMedication ? 'Edit Medication' : 'Add New Medication'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Medication Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            required
                                            placeholder="e.g., Metformin"
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Dosage <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="number"
                                                name="dosage"
                                                value={formData.dosage}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                                required
                                                min="0"
                                                step="0.5"
                                                placeholder="500"
                                            />
                                            <select
                                                name="dosageUnit"
                                                value={formData.dosageUnit}
                                                onChange={handleInputChange}
                                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            >
                                                <option value="mg">mg</option>
                                                <option value="mcg">mcg</option>
                                                <option value="g">g</option>
                                                <option value="ml">ml</option>
                                                <option value="units">units</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Frequency
                                        </label>
                                        <select
                                            name="frequency"
                                            value={formData.frequency}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                        >
                                            <option value="daily">Once daily</option>
                                            <option value="twice_daily">Twice daily</option>
                                            <option value="three_times">Three times daily</option>
                                            <option value="four_times">Four times daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="as_needed">As needed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Times <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-2">
                                            {formData.times.map((time, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <input
                                                        type="time"
                                                        value={time}
                                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                                        required
                                                    />
                                                    {formData.times.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTime(index)}
                                                            className="p-2 text-gray-400 hover:text-red-600"
                                                        >
                                                            <XCircleIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addTime}
                                                className="text-sm text-primary-600 hover:text-primary-700"
                                            >
                                                + Add another time
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date (optional)
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Remaining
                                        </label>
                                        <input
                                            type="number"
                                            name="remaining"
                                            value={formData.remaining}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            min="0"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Instructions
                                        </label>
                                        <input
                                            type="text"
                                            name="instructions"
                                            value={formData.instructions}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            placeholder="e.g., Take with food, before bed"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Prescribed By
                                        </label>
                                        <input
                                            type="text"
                                            name="prescribedBy"
                                            value={formData.prescribedBy}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            placeholder="Dr. Name"
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pharmacy
                                        </label>
                                        <input
                                            type="text"
                                            name="pharmacy"
                                            value={formData.pharmacy}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            placeholder="Pharmacy name"
                                        />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pharmacy Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="pharmacyPhone"
                                            value={formData.pharmacyPhone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                                            rows="2"
                                            placeholder="Additional notes..."
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="reminders"
                                            checked={formData.reminders}
                                            onChange={handleInputChange}
                                            className="rounded text-primary-600"
                                        />
                                        <span className="text-sm text-gray-700">Enable reminders</span>
                                    </label>

                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="refillReminder"
                                            checked={formData.refillReminder}
                                            onChange={handleInputChange}
                                            className="rounded text-primary-600"
                                        />
                                        <span className="text-sm text-gray-700">Refill reminders</span>
                                    </label>
                                </div>

                                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary"
                                    >
                                        {editingMedication ? 'Update' : 'Add'} Medication
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditingMedication(null);
                                            resetForm();
                                        }}
                                        className="flex-1 btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedicationTracker;