// src/components/Layout.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ROUTES } from '../constants/routes';
import {
    HomeIcon,
    ChartBarIcon,
    ClockIcon,
    UserIcon,
    Cog6ToothIcon,
    HeartIcon,
    BeakerIcon,
    ArrowRightOnRectangleIcon,
    SparklesIcon,
    Bars3Icon,
    BellIcon,
    DocumentTextIcon,
    UsersIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import Badge, { CountBadge } from './Badge';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.HOME);
    };

    const navigation = [
        {
            name: 'Dashboard',
            href: ROUTES.DASHBOARD,
            icon: HomeIcon,
            description: 'Overview of your health'
        },
        {
            name: 'Predictions',
            href: ROUTES.PREDICTIONS.NEW,
            icon: BeakerIcon,
            description: 'New risk assessment',
            badge: 'Free'
        },
        {
            name: 'History',
            href: ROUTES.HISTORY,
            icon: ClockIcon,
            description: 'Past assessments'
        },
        {
            name: 'Health Coach',
            href: '/health-coach',
            icon: SparklesIcon,
            description: 'AI health assistant',
            badge: 'New'
        },
        {
            name: 'Symptoms',
            href: ROUTES.SYMPTOMS.LIST,
            icon: HeartIcon,
            description: 'Track your symptoms'
        },
        {
            name: 'Medications',
            href: ROUTES.MEDICATIONS.LIST,
            icon: ChartBarIcon,
            description: 'Manage medications'
        },
        {
            name: 'Family History',
            href: '/family',
            icon: UsersIcon,
            description: 'Family health records'
        },
        {
            name: 'Resources',
            href: ROUTES.RESOURCES,
            icon: DocumentTextIcon,
            description: 'Health articles & tips'
        },
        {
            name: 'Profile',
            href: ROUTES.PROFILE,
            icon: UserIcon,
            description: 'Your account'
        },
        {
            name: 'Settings',
            href: ROUTES.SETTINGS,
            icon: Cog6ToothIcon,
            description: 'Preferences'
        },
    ];

    const isActive = (path) => {
        if (path === '/health-coach') {
            return location.pathname.startsWith('/health-coach');
        }
        return location.pathname === path;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <motion.div
                initial={{ width: sidebarOpen ? 256 : 80 }}
                animate={{ width: sidebarOpen ? 256 : 80 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed inset-y-0 left-0 bg-white shadow-soft border-r border-gray-200 z-30 overflow-hidden"
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
                            <BeakerIcon className="w-8 h-8 text-primary-600" />
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-xl font-bold"
                                    >
                                        <span className="text-primary-600">Diabetes</span>
                                        <span className="text-gray-900">Predictor</span>
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* Sidebar toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? (
                                <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                                        transition-all duration-200 relative group
                                        ${isActive(item.href)
                                            ? 'bg-primary-50 text-primary-600'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-primary-600' : 'text-gray-500'
                                        }`} />

                                    <AnimatePresence>
                                        {sidebarOpen && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex-1 text-sm font-medium"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>

                                    {/* Badge for new/premium items */}
                                    {item.badge && sidebarOpen && (
                                        <Badge variant="primary" size="sm">
                                            {item.badge}
                                        </Badge>
                                    )}

                                    {/* Tooltip for collapsed sidebar */}
                                    {!sidebarOpen && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                            {item.name}
                                            {item.description && (
                                                <span className="block text-gray-400 text-[10px]">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* User section */}
                    <div className="border-t border-gray-200 p-4">
                        {/* User info */}
                        <div className={`
                            flex items-center gap-3 mb-3
                            ${!sidebarOpen && 'justify-center'}
                        `}>
                            <div className="relative">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold text-sm">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                {unreadCount > 0 && (
                                    <CountBadge count={unreadCount} size="sm" className="absolute -top-1 -right-1" />
                                )}
                            </div>

                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex-1 min-w-0"
                                    >
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user?.username || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user?.email || ''}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Logout button */}
                        <button
                            onClick={handleLogout}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5
                                text-sm text-gray-700 rounded-lg
                                hover:bg-red-50 hover:text-red-600
                                transition-colors
                                ${!sidebarOpen && 'justify-center'}
                            `}
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <AnimatePresence>
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        Logout
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main content */}
            <div
                className={`
                    transition-all duration-300
                    ${sidebarOpen ? 'ml-64' : 'ml-20'}
                `}
            >
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 py-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Bars3Icon className="w-5 h-5" />
                        </button>

                        {/* Page title */}
                        <h1 className="text-lg font-semibold text-gray-900">
                            {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                        </h1>

                        {/* Right section */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <BellIcon className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {/* Notifications dropdown */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                                        >
                                            <div className="p-3 border-b border-gray-200">
                                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map(notif => (
                                                        <div key={notif.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                                            <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-gray-500">
                                                        No notifications
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* User menu (mobile) */}
                            <div className="lg:hidden">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-600 font-semibold text-sm">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;