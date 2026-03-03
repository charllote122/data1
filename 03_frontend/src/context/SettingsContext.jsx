// src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import settingsService from '../services/settings';

// Create context
const SettingsContext = createContext(null);

// Export provider as named export
export const SettingsProvider = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        notifications: true,
        emailUpdates: true,
        darkMode: false,
        language: 'en',
        measurementUnit: 'metric'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            loadSettings();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            const data = await settingsService.getSettings();
            setSettings(data || settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const updated = await settingsService.updateSettings(newSettings);
            setSettings(updated);
            return updated;
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    };

    const value = {
        settings,
        loading,
        error,
        updateSettings,
        refresh: loadSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// Export hook as named export
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

// Also export as default for flexibility
export default SettingsProvider;