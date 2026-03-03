import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Mock data - replace with API call
        const mockNotifications = [
            {
                id: 1,
                type: 'success',
                title: 'Prediction Complete',
                message: 'Your latest risk assessment is ready. View your results now.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                read: false,
                actionUrl: '/history/1',
            },
            {
                id: 2,
                type: 'warning',
                title: 'Medication Reminder',
                message: 'Time to take your Metformin (500mg)',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                read: false,
                actionUrl: '/health-coach',
            },
            {
                id: 3,
                type: 'info',
                title: 'Health Tip',
                message: 'Regular exercise can help manage blood sugar levels. Try to get 30 minutes of activity today!',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                read: true,
                actionUrl: '/health-coach',
            },
            {
                id: 4,
                type: 'success',
                title: 'Achievement Unlocked!',
                message: 'Congratulations! You\'ve completed 10 predictions.',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                read: true,
                actionUrl: '/profile',
            },
            {
                id: 5,
                type: 'warning',
                title: 'High Risk Alert',
                message: 'Your latest prediction shows high risk. Please consult with your healthcare provider.',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                read: true,
                actionUrl: '/history/2',
            },
            {
                id: 6,
                type: 'info',
                title: 'Weekly Report Ready',
                message: 'Your weekly health summary is now available for review.',
                timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                read: true,
                actionUrl: '/analytics',
            },
        ];
        setNotifications(mockNotifications);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
            case 'error':
                return <XCircleIcon className="w-6 h-6 text-red-500" />;
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
            default:
                return 'bg-blue-50';
        }
    };

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const clearAll = () => {
        if (window.confirm('Clear all notifications?')) {
            setNotifications([]);
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread') return !notif.read;
        if (filter === 'read') return notif.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">Stay updated with your health alerts and reminders</p>
                </div>
                <div className="flex items-center space-x-3">
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
                </div>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-soft p-2 border border-gray-100 inline-flex"
            >
                {[
                    { id: 'all', name: 'All', count: notifications.length },
                    { id: 'unread', name: 'Unread', count: unreadCount },
                    { id: 'read', name: 'Read', count: notifications.length - unreadCount },
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
            </motion.div>

            {/* Notifications List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <BellIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No notifications to show</p>
                    </div>
                ) : (
                    filteredNotifications.map((notification, index) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative rounded-xl shadow-soft p-4 border ${notification.read ? 'border-gray-200' : 'border-primary-200 bg-primary-50/50'
                                }`}
                        >
                            <div className="flex items-start space-x-4">
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
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                            </span>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="p-1 text-gray-400 hover:text-primary-600"
                                                    title="Mark as read"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {notification.actionUrl && (
                                        <button
                                            onClick={() => window.location.href = notification.actionUrl}
                                            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            View Details →
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!notification.read && (
                                <div className="absolute top-4 right-4">
                                    <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Summary Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
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
                            <p className="text-sm text-purple-600">This Week</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {notifications.filter(n =>
                                    n.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                ).length}
                            </p>
                        </div>
                        <CalendarIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Notifications;