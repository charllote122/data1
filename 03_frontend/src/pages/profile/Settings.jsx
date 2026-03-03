import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BellIcon,
    LockClosedIcon,
    MoonIcon,
    SunIcon,
    GlobeAltIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import toast from 'react-hot-toast';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        // Notification Settings
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        predictionAlerts: true,
        medicationReminders: true,
        weeklyReports: true,

        // Privacy Settings
        shareAnonymousData: false,
        showProfile: true,
        allowDataExport: true,

        // Appearance
        darkMode: false,
        compactView: false,

        // Language
        language: 'en',

        // Security
        twoFactorAuth: false,
        loginAlerts: true,
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleSettingChange = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            // API call to change password
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Password changed successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            // API call to save settings
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await api.get('/predictions/export/', {
                params: { format: 'json' },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `my_health_data_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Data exported successfully');
        } catch (error) {
            toast.error('Failed to export data');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                // API call to delete account
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast.success('Account deleted successfully');
                // Redirect to login
                window.location.href = '/login';
            } catch (error) {
                toast.error('Failed to delete account');
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and security</p>
            </motion.div>

            {/* Settings Sections */}
            <div className="space-y-6">
                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <BellIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                            <Switch
                                checked={settings.emailNotifications}
                                onChange={() => handleSettingChange('emailNotifications')}
                                className={`${settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            >
                                <span
                                    className={`${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Push Notifications</p>
                                <p className="text-sm text-gray-500">Browser push notifications</p>
                            </div>
                            <Switch
                                checked={settings.pushNotifications}
                                onChange={() => handleSettingChange('pushNotifications')}
                                className={`${settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">SMS Notifications</p>
                                <p className="text-sm text-gray-500">Text message alerts</p>
                            </div>
                            <Switch
                                checked={settings.smsNotifications}
                                onChange={() => handleSettingChange('smsNotifications')}
                                className={`${settings.smsNotifications ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Prediction Alerts</p>
                                <p className="text-sm text-gray-500">Get notified about new predictions</p>
                            </div>
                            <Switch
                                checked={settings.predictionAlerts}
                                onChange={() => handleSettingChange('predictionAlerts')}
                                className={`${settings.predictionAlerts ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Medication Reminders</p>
                                <p className="text-sm text-gray-500">Daily medication alerts</p>
                            </div>
                            <Switch
                                checked={settings.medicationReminders}
                                onChange={() => handleSettingChange('medicationReminders')}
                                className={`${settings.medicationReminders ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Weekly Reports</p>
                                <p className="text-sm text-gray-500">Receive weekly health summaries</p>
                            </div>
                            <Switch
                                checked={settings.weeklyReports}
                                onChange={() => handleSettingChange('weeklyReports')}
                                className={`${settings.weeklyReports ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Privacy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Share Anonymous Data</p>
                                <p className="text-sm text-gray-500">Help research by sharing anonymized data</p>
                            </div>
                            <Switch
                                checked={settings.shareAnonymousData}
                                onChange={() => handleSettingChange('shareAnonymousData')}
                                className={`${settings.shareAnonymousData ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Show Profile</p>
                                <p className="text-sm text-gray-500">Make your profile visible to others</p>
                            </div>
                            <Switch
                                checked={settings.showProfile}
                                onChange={() => handleSettingChange('showProfile')}
                                className={`${settings.showProfile ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Allow Data Export</p>
                                <p className="text-sm text-gray-500">Enable exporting your data</p>
                            </div>
                            <Switch
                                checked={settings.allowDataExport}
                                onChange={() => handleSettingChange('allowDataExport')}
                                className={`${settings.allowDataExport ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Appearance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        {settings.darkMode ? (
                            <MoonIcon className="w-6 h-6 text-primary-600" />
                        ) : (
                            <SunIcon className="w-6 h-6 text-primary-600" />
                        )}
                        <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Dark Mode</p>
                                <p className="text-sm text-gray-500">Switch to dark theme</p>
                            </div>
                            <Switch
                                checked={settings.darkMode}
                                onChange={() => handleSettingChange('darkMode')}
                                className={`${settings.darkMode ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Compact View</p>
                                <p className="text-sm text-gray-500">Show more content per page</p>
                            </div>
                            <Switch
                                checked={settings.compactView}
                                onChange={() => handleSettingChange('compactView')}
                                className={`${settings.compactView ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div>
                            <label className="input-label">Language</label>
                            <select
                                value={settings.language}
                                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                                className="input-field"
                            >
                                <option value="en">English</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                                <option value="zh">中文</option>
                                <option value="hi">हिन्दी</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <LockClosedIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    </div>

                    {/* Change Password */}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 mb-6">
                        <h3 className="font-medium text-gray-900">Change Password</h3>

                        <div>
                            <label className="input-label">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="input-label">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="input-field"
                                required
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label className="input-label">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            Update Password
                        </button>
                    </form>

                    {/* Security Settings */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500">Add an extra layer of security</p>
                            </div>
                            <Switch
                                checked={settings.twoFactorAuth}
                                onChange={() => handleSettingChange('twoFactorAuth')}
                                className={`${settings.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Login Alerts</p>
                                <p className="text-sm text-gray-500">Get notified of new logins</p>
                            </div>
                            <Switch
                                checked={settings.loginAlerts}
                                onChange={() => handleSettingChange('loginAlerts')}
                                className={`${settings.loginAlerts ? 'bg-primary-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Data Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-soft p-6 border border-gray-100"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <DevicePhoneMobileIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <ArrowPathIcon className="w-5 h-5 text-primary-600" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Export My Data</p>
                                    <p className="text-sm text-gray-500">Download all your health data</p>
                                </div>
                            </div>
                            <span className="text-primary-600">→</span>
                        </button>

                        <button
                            onClick={handleDeleteAccount}
                            className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                <TrashIcon className="w-5 h-5 text-red-600" />
                                <div className="text-left">
                                    <p className="font-medium text-red-900">Delete Account</p>
                                    <p className="text-sm text-red-600">Permanently delete your account and data</p>
                                </div>
                            </div>
                            <span className="text-red-600">→</span>
                        </button>
                    </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-end"
                >
                    <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="btn-primary px-8"
                    >
                        {loading ? 'Saving...' : 'Save All Settings'}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;