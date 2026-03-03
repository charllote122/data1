// src/context/SymptomsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import symptomsService from '../services/symptoms';

const SymptomsContext = createContext(null);

export const SymptomsProvider = ({ children }) => {
    const { user } = useAuth();
    const [symptoms, setSymptoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trends, setTrends] = useState(null);

    useEffect(() => {
        if (user) {
            loadSymptoms();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadSymptoms = async () => {
        setLoading(true);
        try {
            const data = await symptomsService.getSymptoms();
            setSymptoms(data.results || []);

            const trendsData = await symptomsService.getSymptomTrends();
            setTrends(trendsData);
        } catch (error) {
            console.error('Failed to load symptoms:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const logSymptom = async (data) => {
        try {
            const result = await symptomsService.logSymptom(data);
            await loadSymptoms(); // Refresh list
            return result;
        } catch (error) {
            console.error('Failed to log symptom:', error);
            throw error;
        }
    };

    const value = {
        symptoms,
        loading,
        error,
        trends,
        refresh: loadSymptoms,
        logSymptom
    };

    return (
        <SymptomsContext.Provider value={value}>
            {children}
        </SymptomsContext.Provider>
    );
};

export const useSymptoms = () => {
    const context = useContext(SymptomsContext);
    if (!context) {
        throw new Error('useSymptoms must be used within a SymptomsProvider');
    }
    return context;
};

export default SymptomsProvider;