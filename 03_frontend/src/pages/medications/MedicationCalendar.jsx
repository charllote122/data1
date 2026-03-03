// src/pages/medications/MedicationCalendar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMedications } from '../../hooks'; // Import from hooks barrel
import {
    CalendarIcon, ClockIcon, CheckCircleIcon,
    XCircleIcon, ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

const MedicationCalendar = () => {
    const { medications, loading, error, refresh } = useMedications();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDays, setCalendarDays] = useState([]);

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
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ day: null, medications: [] });
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
                isToday: isSameDay(date, new Date())
            });
        }

        setCalendarDays(days);
    };

    const isSameDay = (date1, date2) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
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

    const getMedicationsForSelectedDate = () => {
        return medications.filter(med => {
            if (!med.is_active) return false;
            const startDate = new Date(med.start_date);
            const endDate = med.end_date ? new Date(med.end_date) : null;

            return selectedDate >= startDate && (!endDate || selectedDate <= endDate);
        });
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Medication Calendar</h1>
                    <p className="text-gray-600 mt-1">View and track your medication schedule</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                                <div
                                    key={index}
                                    onClick={() => handleDateClick(day.date)}
                                    className={`
                                        aspect-square p-2 rounded-lg cursor-pointer transition-all
                                        ${day.day ? 'hover:bg-gray-50' : ''}
                                        ${day.isToday ? 'ring-2 ring-primary-500' : ''}
                                        ${selectedDate && day.date && isSameDay(day.date, selectedDate)
                                            ? 'bg-primary-50 ring-1 ring-primary-500'
                                            : ''
                                        }
                                    `}
                                >
                                    {day.day && (
                                        <>
                                            <div className="text-right text-sm font-medium text-gray-700">
                                                {day.day}
                                            </div>
                                            {day.medications.length > 0 && (
                                                <div className="mt-1">
                                                    <div className="w-2 h-2 bg-primary-500 rounded-full mx-auto"></div>
                                                    <div className="text-xs text-center text-primary-600 mt-1">
                                                        {day.medications.length}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Date Details */}
                    <div className="bg-white rounded-2xl shadow-soft p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarIcon className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                {selectedDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h2>
                        </div>

                        {selectedDateMedications.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <ClockIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-500">No medications scheduled for this day</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedDateMedications.map((medication) => (
                                    <div
                                        key={medication.id}
                                        className="p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                                                <p className="text-sm text-gray-600">{medication.dosage}</p>
                                            </div>
                                            {medication.is_active ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                    <CheckCircleIcon className="w-3 h-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full">
                                                    <XCircleIcon className="w-3 h-3" />
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>Frequency: {medication.frequency}</span>
                                        </div>
                                        {medication.notes && (
                                            <p className="mt-2 text-sm text-gray-500">{medication.notes}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MedicationCalendar;