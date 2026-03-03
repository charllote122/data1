// src/components/Layout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import {
    HomeIcon,
    ChartBarIcon,
    ClockIcon,
    UserIcon,
    Cog6ToothIcon,
    HeartIcon,
    BeakerIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.HOME);
    };

    const navigation = [
        { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: HomeIcon },
        { name: 'Predictions', href: ROUTES.PREDICTIONS.NEW, icon: BeakerIcon },
        { name: 'History', href: ROUTES.HISTORY, icon: ClockIcon },
        { name: 'Symptoms', href: ROUTES.SYMPTOMS.LIST, icon: HeartIcon },
        { name: 'Medications', href: ROUTES.MEDICATIONS.LIST, icon: ChartBarIcon },
        { name: 'Profile', href: ROUTES.PROFILE, icon: UserIcon },
        { name: 'Settings', href: ROUTES.SETTINGS, icon: Cog6ToothIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6">
                        <Link to={ROUTES.DASHBOARD} className="text-xl font-bold">
                            <span className="text-blue-600">Diabetes</span>
                            <span className="text-gray-900">Predictor</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user?.email || ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="ml-64">
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;