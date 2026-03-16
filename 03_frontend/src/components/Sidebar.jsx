// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    BeakerIcon,
    ClockIcon,
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    HeartIcon,
    DocumentTextIcon,
    SparklesIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import Badge from './Badge';

const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        description: 'Overview of your health'
    },
    {
        name: 'New Prediction',
        href: '/prediction',
        icon: BeakerIcon,
        description: 'Assess your diabetes risk',
        badge: 'Free'
    },
    {
        name: 'History',
        href: '/history',
        icon: ClockIcon,
        description: 'Past assessments'
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: ChartBarIcon,
        description: 'Deep insights & trends'
    },
    {
        name: 'Health Coach',
        href: '/health-coach',
        icon: ChatBubbleLeftRightIcon,
        description: 'AI health assistant',
        badge: 'New'
    },
    {
        name: 'Symptoms',
        href: '/symptoms',
        icon: HeartIcon,
        description: 'Track your symptoms'
    },
    {
        name: 'Medications',
        href: '/medications',
        icon: DocumentTextIcon,
        description: 'Manage medications'
    },
    {
        name: 'Family History',
        href: '/family',
        icon: UsersIcon,
        description: 'Family health records'
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: UserIcon,
        description: 'Your account'
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Cog6ToothIcon,
        description: 'Preferences'
    },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/health-coach') {
            return location.pathname.startsWith('/health-coach');
        }
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <HeartIcon className="w-5 h-5 text-primary-600" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            <span className="text-primary-600">Diabetes</span>
                            <span className="text-gray-900">Predictor</span>
                        </h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-lg lg:hidden hover:bg-gray-100 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    transition-all duration-200 relative group
                                    ${active || isActive
                                        ? 'bg-primary-50 text-primary-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-600' : 'text-gray-500'
                                    }`} />

                                <span className="flex-1 text-sm font-medium">
                                    {item.name}
                                </span>

                                {/* Badge for new/premium items */}
                                {item.badge && (
                                    <Badge variant="primary" size="sm">
                                        {item.badge}
                                    </Badge>
                                )}

                                {/* Tooltip for collapsed state - will be shown when sidebar is closed */}
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 lg:hidden">
                                    {item.name}
                                    {item.description && (
                                        <span className="block text-gray-400 text-[10px]">
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Version info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
                    <p className="text-xs text-gray-400 text-center">
                        Version 1.0.0
                    </p>
                </div>
            </div>

            {/* Toggle button for mobile */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed left-4 top-4 z-20 p-2 bg-white rounded-lg shadow-md lg:hidden hover:bg-gray-50 transition-colors"
                    aria-label="Open sidebar"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            )}
        </>
    );
};

export default Sidebar;