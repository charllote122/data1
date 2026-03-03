// src/context/MedicationsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import medicationsService from '../services/medications';

const MedicationsContext = createContext(null);

export const MedicationsProvider = ({ children }) => {
    const { user } = useAuth();
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            loadMedications();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadMedications = async () => {
        setLoading(true);
        try {
            const data = await medicationsService.getMedications();
            setMedications(data.results || []);
        } catch (error) {
            console.error('Failed to load medications:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addMedication = async (data) => {
        try {
            const result = await medicationsService.createMedication(data);
            await loadMedications();
            return result;
        } catch (error) {
            console.error('Failed to add medication:', error);
            throw error;
        }
    };

    const takeDose = async (id) => {
        try {
            const result = await medicationsService.takeDose(id);
            await loadMedications();
            return result;
        } catch (error) {
            console.error('Failed to take dose:', error);
            throw error;
        }
    };

    const value = {
        medications,
        loading,
        error,
        refresh: loadMedications,
        addMedication,
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