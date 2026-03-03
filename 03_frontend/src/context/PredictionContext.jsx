// src/context/PredictionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import predictionsService from '../services/predictions';

const PredictionContext = createContext(null);

export const PredictionProvider = ({ children }) => {
    const { user } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trends, setTrends] = useState(null);

    useEffect(() => {
        if (user) {
            loadPredictions();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadPredictions = async () => {
        setLoading(true);
        try {
            const data = await predictionsService.getMyPredictions();
            setPredictions(data.results || []);

            const trendsData = await predictionsService.getPredictionTrends();
            setTrends(trendsData);
        } catch (error) {
            console.error('Failed to load predictions:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createPrediction = async (data) => {
        try {
            const result = await predictionsService.createPrediction(data);
            await loadPredictions(); // Refresh list
            return result;
        } catch (error) {
            console.error('Failed to create prediction:', error);
            throw error;
        }
    };

    const getPredictionDetail = async (id) => {
        try {
            return await predictionsService.getPrediction(id);
        } catch (error) {
            console.error(`Failed to get prediction ${id}:`, error);
            throw error;
        }
    };

    const getExplanation = async (id) => {
        try {
            return await predictionsService.getPredictionExplanation(id);
        } catch (error) {
            console.error(`Failed to get explanation for ${id}:`, error);
            throw error;
        }
    };

    const value = {
        predictions,
        loading,
        error,
        trends,
        refresh: loadPredictions,
        createPrediction,
        getPredictionDetail,
        getExplanation
    };

    return (
        <PredictionContext.Provider value={value}>
            {children}
        </PredictionContext.Provider>
    );
};

export const usePredictions = () => {
    const context = useContext(PredictionContext);
    if (!context) {
        throw new Error('usePredictions must be used within a PredictionProvider');
    }
    return context;
};

export default PredictionProvider;