// src/pages/medications/MedicationCalendar.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedications } from '../../hooks';
import { Link } from 'react-router-dom';
import {
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    InformationCircleIcon,
    BeakerIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MedicationCalendar = () => {
    const { medications, loading, error, refresh } = useMedications();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);
    const [showDetails, setShowDetails] = useState({});

    useEffect(() => {
        refresh();
    }, []);

    useEffect(() => {
        generateCalendarDays();
    }, [currentDate, medications]);

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ day: null, medications: [], date: null });
        }

        // Add days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dayMedications = medications.filter(med => {
                if (!med.is_active) return false;
                const startDate = new Date(med.start_date);
                const endDate = med.end_date ? new Date(med.end_date) : null;

                return date >= startDate && (!endDate || date <= endDate);
            });

            days.push({
                day: d,
                date: date,
                medications: dayMedications,
                isToday: isSameDay(date, new Date()),
                isSelected: selectedDate && isSameDay(date, selectedDate),
                medicationCount: dayMedications.length
            });
        }

        setCalendarDays(days);
    };

    const isSameDay = (date1, date2) => {
        return date1?.getDate() === date2?.getDate() &&
            date1?.getMonth() === date2?.getMonth() &&
            date1?.getFullYear() === date2?.getFullYear();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (date) => {
        if (date) {
            setSelectedDate(date);
        }
    };

    const toggleDetails = (medicationId) => {
        setShowDetails(prev => ({
            ...prev,
            [medicationId]: !prev[medicationId]
        }));
    };

    const getMedicationsForSelectedDate = () => {
        return medications.filter(med => {
            if (!med.is_active) return false;
            const startDate = new Date(med.start_date);
            const endDate = med.end_date ? new Date(med.end_date) : null;

            return selectedDate >= startDate && (!endDate || selectedDate <= endDate);
        });
    };

    const getFrequencyIcon = (frequency) => {
        const icons = {
            daily: '📅',
            twice_daily: '📅📅',
            three_times: '📅📅📅',
            four_times: '📅📅📅📅',
            weekly: '🗓️',
            monthly: '📆',
            as_needed: '⚡'
        };
        return icons[frequency] || '📅';
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const selectedDateMedications = getMedicationsForSelectedDate();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Medication Calendar</h1>
                        <p className="text-gray-600 mt-1">View and track your medication schedule</p>
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
                            to="/medications"
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to List
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

                {/* Error from context */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <Card>
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePrevMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Previous month"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentDate(new Date())}
                                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={handleNextMonth}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Next month"
                                    >
                                        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Day Names */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {dayNames.map(day => (
                                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: day.date ? 1.05 : 1 }}
                                        onClick={() => day.date && handleDateClick(day.date)}
                                        className={`
                                            aspect-square p-2 rounded-lg cursor-pointer transition-all relative
                                            ${day.date ? 'hover:bg-gray-50' : ''}
                                            ${day.isToday ? 'ring-2 ring-primary-500' : ''}
                                            ${day.isSelected ? 'bg-primary-50 ring-1 ring-primary-500' : ''}
                                            ${!day.date ? 'bg-gray-50' : ''}
                                        `}
                                    >
                                        {day.date && (
                                            <>
                                                <div className="text-right text-sm font-medium text-gray-700">
                                                    {day.day}
                                                </div>
                                                {day.medicationCount > 0 && (
                                                    <div className="mt-1 flex justify-center">
                                                        <div className={`
                                                            px-1.5 py-0.5 rounded-full text-xs font-medium
                                                            ${day.medicationCount > 2 ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-700'}
                                                        `}>
                                                            {day.medicationCount}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Mini indicators for multiple medications */}
                                                {day.medicationCount > 0 && (
                                                    <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5">
                                                        {day.medications.slice(0, 3).map((med, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-1 h-1 bg-primary-400 rounded-full"
                                                                title={med.name}
                                                            />
                                                        ))}
                                                        {day.medicationCount > 3 && (
                                                            <span className="text-[8px] text-gray-400">+{day.medicationCount - 3}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-primary-100 rounded-full"></div>
                                    <span>Has medications</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                    <span>Multiple (3+)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 ring-2 ring-primary-500 rounded-full"></div>
                                    <span>Today</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Selected Date Details */}
                    <div>
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {selectedDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </h2>
                                </div>
                                <Badge variant="primary" size="sm">
                                    {selectedDateMedications.length} medications
                                </Badge>
                            </div>

                            {selectedDateMedications.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <ClockIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No medications scheduled for this day</p>
                                    <Link
                                        to="/medications/new"
                                        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-2"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        Add medication
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                    {selectedDateMedications.map((medication) => (
                                        <motion.div
                                            key={medication.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{getFrequencyIcon(medication.frequency)}</span>
                                                        <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">{medication.dosage}</p>
                                                </div>
                                                <Badge
                                                    variant={medication.is_active ? 'success' : 'gray'}
                                                    size="sm"
                                                >
                                                    {medication.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2 mt-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span className="capitalize">{medication.frequency.replace('_', ' ')}</span>
                                                </div>

                                                {medication.reminder_times?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {medication.reminder_times.map((time, idx) => (
                                                            <span key={idx} className="text-xs bg-white px-2 py-1 rounded-full">
                                                                {time}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => toggleDetails(medication.id)}
                                                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                                                >
                                                    {showDetails[medication.id] ? 'Show less' : 'Show details'}
                                                </button>

                                                <AnimatePresence>
                                                    {showDetails[medication.id] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="text-xs text-gray-500 space-y-1 overflow-hidden"
                                                        >
                                                            <p>Started: {new Date(medication.start_date).toLocaleDateString()}</p>
                                                            {medication.end_date && (
                                                                <p>Ends: {new Date(medication.end_date).toLocaleDateString()}</p>
                                                            )}
                                                            {medication.notes && (
                                                                <p className="mt-2 p-2 bg-white rounded">📝 {medication.notes}</p>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        {/* Quick Stats */}
                        <Card className="mt-4 bg-gradient-to-br from-primary-50 to-secondary-50">
                            <h3 className="font-semibold text-gray-900 mb-3">Monthly Summary</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary-600">
                                        {medications.filter(m => m.is_active).length}
                                    </p>
                                    <p className="text-xs text-gray-600">Active Medications</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {calendarDays.filter(d => d.medicationCount > 0).length}
                                    </p>
                                    <p className="text-xs text-gray-600">Days with meds</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MedicationCalendar;