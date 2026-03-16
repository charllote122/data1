// src/pages/profile/Settings.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BellIcon,
    LockClosedIcon,
    MoonIcon,
    SunIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    TrashIcon,
    EyeIcon,
    EyeSlashIcon,
    ClockIcon,
    KeyIcon,
    UserIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/users';
import notificationService from '../../services/notifications';
import settingsService from '../../services/settings';

const Settings = () => {
    const { user, updateUser, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('notifications');
    const [systemTheme, setSystemTheme] = useState('light');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Settings state
    const [settings, setSettings] = useState({
        notifications: {
            email: {
                predictions: true,
                medications: true,
                symptoms: true,
                goals: true,
                weekly_report: true,
                marketing: false
            },
            push: {
                predictions: true,
                medications: true,
                symptoms: false,
                goals: true,
                reminders: true
            },
            sms: {
                medications: false,
                emergencies: true
            },
            quiet_hours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            }
        },
        appearance: {
            theme: 'system', // 'light', 'dark', or 'system'
            compact_view: false,
            fontSize: 'medium'
        },
        privacy: {
            profile_visibility: 'private',
            share_anonymous_data: false,
            show_activity: true
        },
        security: {
            two_factor_auth: false,
            login_alerts: true,
            session_timeout: 30
        }
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [sessions, setSessions] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    // Detect system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Apply theme based on settings
    useEffect(() => {
        const applyTheme = () => {
            let themeToApply = settings.appearance.theme;

            if (themeToApply === 'system') {
                themeToApply = systemTheme;
            }

            if (themeToApply === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        applyTheme();
    }, [settings.appearance.theme, systemTheme]);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
        loadSessions();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Try to load from API first
            try {
                const data = await settingsService.getSettings();
                setSettings(prev => ({ ...prev, ...data }));
            } catch (apiError) {
                console.log('Using default settings');
                // Load from localStorage as fallback
                const saved = localStorage.getItem('userSettings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setSettings(parsed);

                    // Apply saved theme
                    if (parsed.appearance?.theme) {
                        let themeToApply = parsed.appearance.theme;
                        if (themeToApply === 'system') {
                            themeToApply = systemTheme;
                        }
                        if (themeToApply === 'dark') {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const loadSessions = async () => {
        try {
            const data = await userService.getActiveSessions();
            setSessions(data || []);
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    };

    const handleSettingChange = async (section, subsection, key, value = null) => {
        const newValue = value !== null ? value : !settings[section][subsection][key];

        setSettings(prev => {
            const newSettings = {
                ...prev,
                [section]: {
                    ...prev[section],
                    [subsection]: {
                        ...prev[section][subsection],
                        [key]: newValue
                    }
                }
            };

            // Save to localStorage
            localStorage.setItem('userSettings', JSON.stringify(newSettings));

            return newSettings;
        });

        // Try to save to API
        try {
            if (section === 'notifications') {
                await notificationService.updatePreferences(settings.notifications);
            } else {
                await settingsService.updateSettings(settings);
            }
            toast.success('Setting updated');
        } catch (error) {
            console.log('Setting saved locally only');
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
            toast.error('All fields are required');
            return;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setSaving(true);
        try {
            await userService.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            toast.success('Password changed successfully');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleTerminateSession = async (sessionId) => {
        try {
            await userService.terminateSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            toast.success('Session terminated');
        } catch (error) {
            toast.error('Failed to terminate session');
        }
    };

    const handleTerminateAllSessions = async () => {
        if (window.confirm('Are you sure you want to log out all other devices?')) {
            try {
                await userService.terminateAllSessions();
                setSessions([]);
                toast.success('All other sessions terminated');
            } catch (error) {
                toast.error('Failed to terminate sessions');
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== 'DELETE') {
            toast.error('Please type DELETE to confirm');
            return;
        }

        try {
            await userService.deleteAccount();
            toast.success('Account deleted successfully');
            localStorage.clear();
            await logout();
            window.location.href = '/';
        } catch (error) {
            toast.error(error.message || 'Failed to delete account');
        }
    };

    const tabs = [
        { id: 'notifications', name: 'Notifications', icon: BellIcon },
        { id: 'appearance', name: 'Appearance', icon: SunIcon },
        { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
        { id: 'security', name: 'Security', icon: LockClosedIcon },
        { id: 'account', name: 'Account', icon: UserIcon },
    ];

    // Get current effective theme for display
    const getEffectiveTheme = () => {
        if (settings.appearance.theme === 'system') {
            return systemTheme;
        }
        return settings.appearance.theme;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account preferences</p>
            </motion.div>

            <div className="mt-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-medium">{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                                    <div className="space-y-8">
                                        {/* Email Notifications */}
                                        <div>
                                            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                                <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                                                Email Notifications
                                            </h3>
                                            <div className="space-y-3 pl-7">
                                                {Object.entries(settings.notifications.email).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <span className="text-gray-700 capitalize">
                                                            {key.replace('_', ' ')}
                                                        </span>
                                                        <Switch
                                                            checked={value}
                                                            onChange={() => handleSettingChange('notifications', 'email', key)}
                                                            className={`${value ? 'bg-primary-600' : 'bg-gray-300'
                                                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                                        >
                                                            <span
                                                                className={`${value ? 'translate-x-6' : 'translate-x-1'
                                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                            />
                                                        </Switch>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Push Notifications */}
                                        <div>
                                            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                                <DevicePhoneMobileIcon className="w-5 h-5 text-primary-600" />
                                                Push Notifications
                                            </h3>
                                            <div className="space-y-3 pl-7">
                                                {Object.entries(settings.notifications.push).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <span className="text-gray-700 capitalize">
                                                            {key.replace('_', ' ')}
                                                        </span>
                                                        <Switch
                                                            checked={value}
                                                            onChange={() => handleSettingChange('notifications', 'push', key)}
                                                            className={`${value ? 'bg-primary-600' : 'bg-gray-300'}`}
                                                        >
                                                            <span
                                                                className={`${value ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </Switch>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* SMS Notifications */}
                                        <div>
                                            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                                <DevicePhoneMobileIcon className="w-5 h-5 text-primary-600" />
                                                SMS Notifications
                                            </h3>
                                            <div className="space-y-3 pl-7">
                                                {Object.entries(settings.notifications.sms).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <span className="text-gray-700 capitalize">{key}</span>
                                                        <Switch
                                                            checked={value}
                                                            onChange={() => handleSettingChange('notifications', 'sms', key)}
                                                            className={`${value ? 'bg-primary-600' : 'bg-gray-300'}`}
                                                        >
                                                            <span
                                                                className={`${value ? 'translate-x-6' : 'translate-x-1'}`}
                                                            />
                                                        </Switch>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quiet Hours */}
                                        <div>
                                            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                                <ClockIcon className="w-5 h-5 text-primary-600" />
                                                Quiet Hours
                                            </h3>
                                            <div className="space-y-4 pl-7">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-700">Enable quiet hours</span>
                                                    <Switch
                                                        checked={settings.notifications.quiet_hours.enabled}
                                                        onChange={() => handleSettingChange('notifications', 'quiet_hours', 'enabled')}
                                                        className={`${settings.notifications.quiet_hours.enabled ? 'bg-primary-600' : 'bg-gray-300'}`}
                                                    >
                                                        <span
                                                            className={`${settings.notifications.quiet_hours.enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                                        />
                                                    </Switch>
                                                </div>

                                                {settings.notifications.quiet_hours.enabled && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                                                            <input
                                                                type="time"
                                                                value={settings.notifications.quiet_hours.start}
                                                                onChange={(e) => handleSettingChange('notifications', 'quiet_hours', 'start', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-600 mb-1">End Time</label>
                                                            <input
                                                                type="time"
                                                                value={settings.notifications.quiet_hours.end}
                                                                onChange={(e) => handleSettingChange('notifications', 'quiet_hours', 'end', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Appearance Tab */}
                            {activeTab === 'appearance' && (
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance</h2>

                                    {/* Theme Preview Indicator */}
                                    <div className="mb-6 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Current theme:</span>
                                        <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                            {settings.appearance.theme === 'system' ? (
                                                <>System ({getEffectiveTheme()} mode)</>
                                            ) : (
                                                <>{settings.appearance.theme === 'dark' ? 'Dark' : 'Light'} mode</>
                                            )}
                                            {getEffectiveTheme() === 'dark' ? (
                                                <MoonIcon className="w-4 h-4 text-primary-600" />
                                            ) : (
                                                <SunIcon className="w-4 h-4 text-yellow-500" />
                                            )}
                                        </span>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                            <div className="grid grid-cols-3 gap-4 max-w-2xl">
                                                {/* Light Theme */}
                                                <button
                                                    onClick={() => handleSettingChange('appearance', 'appearance', 'theme', 'light')}
                                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${settings.appearance.theme === 'light'
                                                            ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="w-full h-20 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mb-2 flex items-center justify-center">
                                                        <SunIcon className={`w-8 h-8 ${settings.appearance.theme === 'light' ? 'text-yellow-600' : 'text-yellow-500'
                                                            }`} />
                                                    </div>
                                                    <SunIcon className={`w-5 h-5 ${settings.appearance.theme === 'light' ? 'text-primary-600' : 'text-gray-500'
                                                        }`} />
                                                    <span className="text-sm font-medium">Light</span>
                                                </button>

                                                {/* Dark Theme */}
                                                <button
                                                    onClick={() => handleSettingChange('appearance', 'appearance', 'theme', 'dark')}
                                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${settings.appearance.theme === 'dark'
                                                            ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="w-full h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg mb-2 flex items-center justify-center">
                                                        <MoonIcon className={`w-8 h-8 ${settings.appearance.theme === 'dark' ? 'text-blue-300' : 'text-blue-200'
                                                            }`} />
                                                    </div>
                                                    <MoonIcon className={`w-5 h-5 ${settings.appearance.theme === 'dark' ? 'text-primary-600' : 'text-gray-500'
                                                        }`} />
                                                    <span className="text-sm font-medium">Dark</span>
                                                </button>

                                                {/* System Theme */}
                                                <button
                                                    onClick={() => handleSettingChange('appearance', 'appearance', 'theme', 'system')}
                                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${settings.appearance.theme === 'system'
                                                            ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className="w-full h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg mb-2 flex items-center justify-center">
                                                        <ComputerDesktopIcon className={`w-8 h-8 ${settings.appearance.theme === 'system' ? 'text-purple-600' : 'text-purple-500'
                                                            }`} />
                                                    </div>
                                                    <ComputerDesktopIcon className={`w-5 h-5 ${settings.appearance.theme === 'system' ? 'text-primary-600' : 'text-gray-500'
                                                        }`} />
                                                    <span className="text-sm font-medium">System</span>
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                System theme follows your device's light/dark mode preference
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                                            <select
                                                value={settings.appearance.fontSize}
                                                onChange={(e) => handleSettingChange('appearance', 'appearance', 'fontSize', e.target.value)}
                                                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                            >
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between max-w-md">
                                            <div>
                                                <p className="font-medium text-gray-900">Compact View</p>
                                                <p className="text-sm text-gray-500">Show more content per page</p>
                                            </div>
                                            <Switch
                                                checked={settings.appearance.compact_view}
                                                onChange={() => handleSettingChange('appearance', 'appearance', 'compact_view')}
                                                className={`${settings.appearance.compact_view ? 'bg-primary-600' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                            >
                                                <span
                                                    className={`${settings.appearance.compact_view ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>

                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Profile Visibility
                                            </label>
                                            <select
                                                value={settings.privacy.profile_visibility}
                                                onChange={(e) => handleSettingChange('privacy', 'privacy', 'profile_visibility', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                            >
                                                <option value="public">Public</option>
                                                <option value="private">Private</option>
                                                <option value="friends">Friends Only</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">Share Anonymous Data</p>
                                                <p className="text-sm text-gray-500">Help improve our services</p>
                                            </div>
                                            <Switch
                                                checked={settings.privacy.share_anonymous_data}
                                                onChange={() => handleSettingChange('privacy', 'privacy', 'share_anonymous_data')}
                                                className={`${settings.privacy.share_anonymous_data ? 'bg-primary-600' : 'bg-gray-300'}`}
                                            >
                                                <span
                                                    className={`${settings.privacy.share_anonymous_data ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </Switch>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">Show Activity</p>
                                                <p className="text-sm text-gray-500">Display your recent activity</p>
                                            </div>
                                            <Switch
                                                checked={settings.privacy.show_activity}
                                                onChange={() => handleSettingChange('privacy', 'privacy', 'show_activity')}
                                                className={`${settings.privacy.show_activity ? 'bg-primary-600' : 'bg-gray-300'}`}
                                            >
                                                <span
                                                    className={`${settings.privacy.show_activity ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </Switch>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    {/* Change Password */}
                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

                                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.current ? 'text' : 'password'}
                                                        name="current_password"
                                                        value={passwordData.current_password}
                                                        onChange={handlePasswordChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                    >
                                                        {showPassword.current ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        name="new_password"
                                                        value={passwordData.new_password}
                                                        onChange={handlePasswordChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                                        required
                                                        minLength={8}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                    >
                                                        {showPassword.new ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword.confirm ? 'text' : 'password'}
                                                        name="confirm_password"
                                                        value={passwordData.confirm_password}
                                                        onChange={handlePasswordChange}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                    >
                                                        {showPassword.confirm ? <EyeSlashIcon className="w-5 h-5 text-gray-400" /> : <EyeIcon className="w-5 h-5 text-gray-400" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors"
                                            >
                                                {saving ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Two-Factor Authentication */}
                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
                                                <p className="text-sm text-gray-500">Add an extra layer of security</p>
                                            </div>
                                            <Switch
                                                checked={settings.security.two_factor_auth}
                                                onChange={() => handleSettingChange('security', 'security', 'two_factor_auth')}
                                                className={`${settings.security.two_factor_auth ? 'bg-primary-600' : 'bg-gray-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                            >
                                                <span
                                                    className={`${settings.security.two_factor_auth ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </Switch>
                                        </div>
                                    </div>

                                    {/* Login Alerts */}
                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">Login Alerts</h2>
                                                <p className="text-sm text-gray-500">Get notified of new logins</p>
                                            </div>
                                            <Switch
                                                checked={settings.security.login_alerts}
                                                onChange={() => handleSettingChange('security', 'security', 'login_alerts')}
                                                className={`${settings.security.login_alerts ? 'bg-primary-600' : 'bg-gray-300'}`}
                                            >
                                                <span
                                                    className={`${settings.security.login_alerts ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </Switch>
                                        </div>
                                    </div>

                                    {/* Session Timeout */}
                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Timeout</h2>
                                        <select
                                            value={settings.security.session_timeout}
                                            onChange={(e) => handleSettingChange('security', 'security', 'session_timeout', parseInt(e.target.value))}
                                            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={60}>1 hour</option>
                                            <option value={120}>2 hours</option>
                                            <option value={240}>4 hours</option>
                                        </select>
                                    </div>

                                    {/* Active Sessions */}
                                    {sessions.length > 0 && (
                                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h2 className="text-lg font-semibold text-gray-900">Active Sessions</h2>
                                                {sessions.length > 1 && (
                                                    <button
                                                        onClick={handleTerminateAllSessions}
                                                        className="text-sm text-red-600 hover:text-red-700"
                                                    >
                                                        Log out all other devices
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                {sessions.map((session) => (
                                                    <div
                                                        key={session.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            {session.device_type === 'mobile' ? (
                                                                <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
                                                            ) : (
                                                                <ComputerDesktopIcon className="w-5 h-5 text-gray-400" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {session.device || 'Unknown'} • {session.browser || 'Unknown'}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    IP: {session.ip || 'Unknown'} • Last active: {session.last_active ? new Date(session.last_active).toLocaleString() : 'Unknown'}
                                                                </p>
                                                            </div>
                                                            {session.is_current && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>
                                                        {!session.is_current && (
                                                            <button
                                                                onClick={() => handleTerminateSession(session.id)}
                                                                className="text-sm text-red-600 hover:text-red-700"
                                                            >
                                                                Terminate
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Account Tab */}
                            {activeTab === 'account' && (
                                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h2>

                                    <div className="space-y-6 max-w-md">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Email</p>
                                            <p className="font-medium text-gray-900">{user?.email || 'Not available'}</p>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Username</p>
                                            <p className="font-medium text-gray-900">{user?.username || 'Not available'}</p>
                                        </div>

                                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Delete Account</h3>
                                            <p className="text-sm text-yellow-700 mb-4">
                                                Once you delete your account, there is no going back. All your data will be permanently removed.
                                            </p>

                                            {!showDeleteConfirm ? (
                                                <button
                                                    onClick={() => setShowDeleteConfirm(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                    Delete Account
                                                </button>
                                            ) : (
                                                <div className="space-y-4">
                                                    <p className="text-sm text-gray-700">
                                                        Type <span className="font-mono bg-white px-2 py-1 rounded border border-gray-300">DELETE</span> to confirm
                                                    </p>
                                                    <input
                                                        type="text"
                                                        value={deleteConfirmationText}
                                                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                                        placeholder="DELETE"
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={handleDeleteAccount}
                                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            Confirm Delete
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowDeleteConfirm(false);
                                                                setDeleteConfirmationText('');
                                                            }}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;