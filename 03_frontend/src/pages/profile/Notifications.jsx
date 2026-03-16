// src/pages/profile/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BellIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    BeakerIcon,
    CalendarIcon,
    TrashIcon,
    CheckIcon,
    ArrowPathIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon,
    PhoneIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format } from 'date-fns';
import { useNotifications } from '../../context/NotificationContext';
import notificationService from '../../services/notifications';

const Notifications = () => {
    const { notifications: contextNotifications, refreshNotifications } = useNotifications();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [preferences, setPreferences] = useState({
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        marketing_emails: false,
        reminder_frequency: 'daily',
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00'
    });
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const [preferencesSuccess, setPreferencesSuccess] = useState('');

    useEffect(() => {
        loadNotifications();
        loadPreferences();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPreferences = async () => {
        try {
            const data = await notificationService.getPreferences();
            setPreferences(data);
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
    };

    const savePreferences = async () => {
        setPreferencesLoading(true);
        setPreferencesSuccess('');
        try {
            await notificationService.updatePreferences(preferences);
            setPreferencesSuccess('Preferences saved successfully!');
            setTimeout(() => setPreferencesSuccess(''), 3000);
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setPreferencesLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, read: true } : notif
                )
            );
            refreshNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            refreshNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(notif => notif.id !== id));
            if (selectedNotification?.id === id) {
                setSelectedNotification(null);
                setShowDetails(false);
            }
            refreshNotifications();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const deleteMultiple = async () => {
        if (selectedIds.length === 0) return;

        try {
            await notificationService.deleteMultiple(selectedIds);
            setNotifications(prev => prev.filter(notif => !selectedIds.includes(notif.id)));
            setSelectedIds([]);
            refreshNotifications();
        } catch (error) {
            console.error('Failed to delete notifications:', error);
        }
    };

    const clearAll = async () => {
        if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            try {
                await notificationService.clearAll();
                setNotifications([]);
                setSelectedIds([]);
                refreshNotifications();
            } catch (error) {
                console.error('Failed to clear notifications:', error);
            }
        }
    };

    const archiveNotification = async (id) => {
        try {
            await notificationService.archiveNotification(id);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, archived: true } : notif
                )
            );
        } catch (error) {
            console.error('Failed to archive notification:', error);
        }
    };

    const restoreNotification = async (id) => {
        try {
            await notificationService.restoreNotification(id);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, archived: false } : notif
                )
            );
        } catch (error) {
            console.error('Failed to restore notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
            case 'error':
                return <XCircleIcon className="w-6 h-6 text-red-500" />;
            case 'health':
                return <HeartIcon className="w-6 h-6 text-pink-500" />;
            case 'medication':
                return <BeakerIcon className="w-6 h-6 text-purple-500" />;
            case 'reminder':
                return <ClockIcon className="w-6 h-6 text-blue-500" />;
            default:
                return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50';
            case 'warning':
                return 'bg-yellow-50';
            case 'error':
                return 'bg-red-50';
            case 'health':
                return 'bg-pink-50';
            case 'medication':
                return 'bg-purple-50';
            case 'reminder':
                return 'bg-blue-50';
            default:
                return 'bg-blue-50';
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredNotifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredNotifications.map(n => n.id));
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        // Filter by read/unread
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        if (filter === 'archived') return notif.archived;

        // Search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                notif.title?.toLowerCase().includes(searchLower) ||
                notif.message?.toLowerCase().includes(searchLower)
            );
        }

        // Date range
        if (dateRange.start && dateRange.end) {
            const notifDate = new Date(notif.timestamp);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            return notifDate >= startDate && notifDate <= endDate;
        }

        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;
    const archivedCount = notifications.filter(n => n.archived).length;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">Stay updated with your health alerts and reminders</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowPreferences(!showPreferences)}
                        className="btn-secondary flex items-center space-x-2"
                    >
                        <BellIcon className="w-4 h-4" />
                        <span>Preferences</span>
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="btn-secondary flex items-center space-x-2"
                        >
                            <CheckIcon className="w-4 h-4" />
                            <span>Mark all as read</span>
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="btn-secondary flex items-center space-x-2 text-red-600 hover:text-red-700"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Clear all</span>
                        </button>
                    )}
                    <button
                        onClick={loadNotifications}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        title="Refresh"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </motion.div>

            {/* Preferences Panel */}
            <AnimatePresence>
                {showPreferences && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                                {preferencesSuccess && (
                                    <span className="text-sm text-green-600">{preferencesSuccess}</span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Notification Channels */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-700">Notification Channels</h3>

                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-600">Email Notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.email_notifications}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                email_notifications: e.target.checked
                                            })}
                                            className="toggle"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-600">Push Notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.push_notifications}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                push_notifications: e.target.checked
                                            })}
                                            className="toggle"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-600">SMS Notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.sms_notifications}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                sms_notifications: e.target.checked
                                            })}
                                            className="toggle"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <span className="text-gray-600">Marketing Emails</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.marketing_emails}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                marketing_emails: e.target.checked
                                            })}
                                            className="toggle"
                                        />
                                    </label>
                                </div>

                                {/* Reminder Settings */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-700">Reminder Settings</h3>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Reminder Frequency
                                        </label>
                                        <select
                                            value={preferences.reminder_frequency}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                reminder_frequency: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="realtime">Real-time</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Quiet Hours Start
                                        </label>
                                        <input
                                            type="time"
                                            value={preferences.quiet_hours_start}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                quiet_hours_start: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            Quiet Hours End
                                        </label>
                                        <input
                                            type="time"
                                            value={preferences.quiet_hours_end}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                quiet_hours_end: e.target.value
                                            })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowPreferences(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={savePreferences}
                                    disabled={preferencesLoading}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {preferencesLoading && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search and Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-soft p-4 border border-gray-100"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Start date"
                        />
                        <span className="text-gray-500 self-center">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="End date"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', name: 'All', count: notifications.length },
                            { id: 'unread', name: 'Unread', count: unreadCount },
                            { id: 'read', name: 'Read', count: notifications.length - unreadCount - archivedCount },
                            { id: 'archived', name: 'Archived', count: archivedCount },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.id
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {tab.name} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {selectedIds.length} notification{selectedIds.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    selectedIds.forEach(id => markAsRead(id));
                                    setSelectedIds([]);
                                }}
                                className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                            >
                                Mark as read
                            </button>
                            <button
                                onClick={() => {
                                    selectedIds.forEach(id => archiveNotification(id));
                                    setSelectedIds([]);
                                }}
                                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                            >
                                Archive
                            </button>
                            <button
                                onClick={deleteMultiple}
                                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Notifications List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {loading ? (
                    <div className="text-center py-12">
                        <ArrowPathIcon className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications to show</p>
                        {(searchTerm || dateRange.start || dateRange.end) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setDateRange({ start: '', end: '' });
                                }}
                                className="mt-4 text-primary-600 hover:text-primary-700"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative rounded-xl shadow-soft p-4 border cursor-pointer hover:shadow-md transition-shadow
                                ${notification.read ? 'border-gray-200' : 'border-primary-200 bg-primary-50/50'}
                                ${notification.archived ? 'opacity-60' : ''}
                                ${selectedIds.includes(notification.id) ? 'ring-2 ring-primary-500' : ''}`}
                            onClick={() => {
                                setSelectedNotification(notification);
                                setShowDetails(true);
                            }}
                        >
                            <div className="flex items-start space-x-4">
                                {/* Checkbox for bulk actions */}
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(notification.id)}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            toggleSelect(notification.id);
                                        }}
                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </div>

                                <div className={`p-2 rounded-lg ${getBgColor(notification.type)}`}>
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className={`font-semibold ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                                            {/* Metadata */}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                </span>
                                                {notification.category && (
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                                        {notification.category}
                                                    </span>
                                                )}
                                                {notification.priority === 'high' && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                                                        High Priority
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-1">
                                            {notification.archived ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        restoreNotification(notification.id);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-blue-600"
                                                    title="Restore"
                                                >
                                                    <ArrowPathIcon className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    {!notification.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-primary-600"
                                                            title="Mark as read"
                                                        >
                                                            <CheckIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            archiveNotification(notification.id);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-blue-600"
                                                        title="Archive"
                                                    >
                                                        <EyeSlashIcon className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {notification.actionUrl && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.location.href = notification.actionUrl;
                                            }}
                                            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            View Details →
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!notification.read && !notification.archived && (
                                <div className="absolute top-4 right-4">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-600"></span>
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Notification Detail Modal */}
            <AnimatePresence>
                {showDetails && selectedNotification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowDetails(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl max-w-lg w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${getBgColor(selectedNotification.type)}`}>
                                        {getIcon(selectedNotification.type)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedNotification.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(selectedNotification.timestamp), 'PPP p')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-gray-700">{selectedNotification.message}</p>

                                {selectedNotification.details && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                                            {JSON.stringify(selectedNotification.details, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {selectedNotification.actionUrl && (
                                    <button
                                        onClick={() => {
                                            window.location.href = selectedNotification.actionUrl;
                                            setShowDetails(false);
                                        }}
                                        className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Take Action
                                    </button>
                                )}

                                <div className="flex gap-2">
                                    {!selectedNotification.read && (
                                        <button
                                            onClick={() => {
                                                markAsRead(selectedNotification.id);
                                                setShowDetails(false);
                                            }}
                                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            deleteNotification(selectedNotification.id);
                                            setShowDetails(false);
                                        }}
                                        className="flex-1 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
            >
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600">Total</p>
                            <p className="text-2xl font-bold text-blue-700">{notifications.length}</p>
                        </div>
                        <BellIcon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600">Read</p>
                            <p className="text-2xl font-bold text-green-700">
                                {notifications.filter(n => n.read).length}
                            </p>
                        </div>
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600">Unread</p>
                            <p className="text-2xl font-bold text-yellow-700">{unreadCount}</p>
                        </div>
                        <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600">Archived</p>
                            <p className="text-2xl font-bold text-purple-700">{archivedCount}</p>
                        </div>
                        <EyeSlashIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-pink-600">This Week</p>
                            <p className="text-2xl font-bold text-pink-700">
                                {notifications.filter(n =>
                                    new Date(n.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ).length}
                            </p>
                        </div>
                        <CalendarIcon className="w-8 h-8 text-pink-500" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Notifications;