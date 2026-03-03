// src/context/HealthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import healthService from '../services/health';

const HealthContext = createContext(null);

export const HealthProvider = ({ children }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [familyHistory, setFamilyHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            loadProfile();
            loadFamilyHistory();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await healthService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load health profile:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadFamilyHistory = async () => {
        try {
            // You'll need to add this method to your health service
            // const data = await healthService.getFamilyHistory();
            // setFamilyHistory(data);
            setFamilyHistory([]); // Placeholder
        } catch (error) {
            console.error('Failed to load family history:', error);
        }
    };

    const updateProfile = async (data) => {
        try {
            const updated = await healthService.updateProfile(data);
            setProfile(updated);
            return { success: true, data: updated };
        } catch (error) {
            console.error('Failed to update health profile:', error);
            return { success: false, error: error.message };
        }
    };

    const addFamilyHistory = async (data) => {
        try {
            // You'll need to add this method to your health service
            // const result = await healthService.addFamilyHistory(data);
            // setFamilyHistory(prev => [...prev, result]);
            return { success: true, data: { id: Date.now(), ...data } };
        } catch (error) {
            console.error('Failed to add family history:', error);
            return { success: false, error: error.message };
        }
    };

    const removeFamilyMember = async (id) => {
        try {
            // You'll need to add this method to your health service
            // await healthService.deleteFamilyHistory(id);
            setFamilyHistory(prev => prev.filter(member => member.id !== id));
            return { success: true };
        } catch (error) {
            console.error('Failed to remove family member:', error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        profile,
        familyHistory,
        loading,
        error,
        refresh: loadProfile,
        updateProfile,
        addFamilyHistory,
        removeFamilyMember
    };

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
};

// ✅ This is the key export that was missing
export const useHealth = () => {
    const context = useContext(HealthContext);
    if (!context) {
        throw new Error('useHealth must be used within a HealthProvider');
    }
    return context;
};

export default HealthProvider;