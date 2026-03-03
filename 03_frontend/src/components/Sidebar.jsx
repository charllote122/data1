import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'New Prediction', href: '/prediction', icon: BeakerIcon },
    { name: 'History', href: '/history', icon: ClockIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Health Coach', href: '/health-coach', icon: ChatBubbleLeftRightIcon },
    { name: 'Health Tips', href: '/resources', icon: HeartIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Settings', href: '/profile/settings', icon: Cog6ToothIcon },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
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
                        <HeartIcon className="w-8 h-8 text-primary-600" />
                        <h1 className="text-xl font-bold text-gray-900">HealthPredict</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 rounded-lg lg:hidden hover:bg-gray-100"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'nav-link-active' : ''}`
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
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
                    className="fixed left-4 top-4 z-20 p-2 bg-white rounded-lg shadow-md lg:hidden"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            )}
        </>
    );
};

export default Sidebar;