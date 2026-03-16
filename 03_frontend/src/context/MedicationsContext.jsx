// src/context/MedicationsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import medicationsService from '../services/medications';
import toast from 'react-hot-toast';

const MedicationsContext = createContext(null);

export const MedicationsProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load medications when component mounts
    useEffect(() => {
        console.log('📋 MedicationsProvider mounted');
        loadMedications();
    }, []); // Load once on mount

    const loadMedications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('📤 Loading medications...');
            const data = await medicationsService.getMedications();
            console.log('📥 Medications loaded:', data);

            // Handle different response formats
            const meds = data.results || data.data || data || [];
            setMedications(Array.isArray(meds) ? meds : []);
        } catch (error) {
            console.error('❌ Failed to load medications:', error);
            setError(error.message || 'Failed to load medications');
            // Don't show toast for auth errors
            if (!error.message.includes('token')) {
                toast.error('Failed to load medications');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const getMedication = useCallback(async (id) => {
        try {
            console.log('📤 Fetching medication:', id);
            const data = await medicationsService.getMedication(id);
            return data;
        } catch (error) {
            console.error('❌ Failed to get medication:', error);
            toast.error('Failed to load medication');
            throw error;
        }
    }, []);

    const addMedication = useCallback(async (data) => {
        try {
            console.log('📤 Adding medication:', data);

            // Validate required fields
            if (!data.name?.trim()) throw new Error('Medication name is required');
            if (!data.dosage?.trim()) throw new Error('Dosage is required');
            if (!data.start_date) throw new Error('Start date is required');

            const result = await medicationsService.createMedication(data);
            console.log('✅ Medication added:', result);

            // Refresh the list
            await loadMedications();
            toast.success('Medication added successfully');
            return result;
        } catch (error) {
            console.error('❌ Failed to add medication:', error);
            toast.error(error.message || 'Failed to add medication');
            throw error;
        }
    }, [loadMedications]);

    const updateMedication = useCallback(async (id, data) => {
        try {
            console.log('📤 Updating medication:', id, data);

            const result = await medicationsService.updateMedication(id, data);
            console.log('✅ Medication updated:', result);

            await loadMedications();
            toast.success('Medication updated successfully');
            return result;
        } catch (error) {
            console.error('❌ Failed to update medication:', error);
            toast.error(error.message || 'Failed to update medication');
            throw error;
        }
    }, [loadMedications]);

    const deleteMedication = useCallback(async (id) => {
        try {
            console.log('📤 Deleting medication:', id);

            await medicationsService.deleteMedication(id);
            console.log('✅ Medication deleted');

            await loadMedications();
            toast.success('Medication deleted successfully');
        } catch (error) {
            console.error('❌ Failed to delete medication:', error);
            toast.error(error.message || 'Failed to delete medication');
            throw error;
        }
    }, [loadMedications]);

    const takeDose = useCallback(async (id) => {
        try {
            console.log('📤 Taking dose for medication:', id);

            const result = await medicationsService.takeDose(id);
            console.log('✅ Dose taken:', result);

            await loadMedications();
            toast.success('Dose recorded');
            return result;
        } catch (error) {
            console.error('❌ Failed to take dose:', error);
            toast.error('Failed to record dose');
            throw error;
        }
    }, [loadMedications]);

    const refresh = useCallback(async () => {
        await loadMedications();
    }, [loadMedications]);

    const value = {
        medications,
        loading,
        error,
        refresh,
        getMedication,
        addMedication,
        updateMedication,
        deleteMedication,
        takeDose
    };

    return (
        <MedicationsContext.Provider value={value}>
            {children}
        </MedicationsContext.Provider>
    );
};

export const useMedications = () => {
    const context = useContext(MedicationsContext);
    if (!context) {
        throw new Error('useMedications must be used within a MedicationsProvider');
    }
    return context;
};

export default MedicationsProvider;