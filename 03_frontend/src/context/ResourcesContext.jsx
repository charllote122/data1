// src/context/ResourcesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import resourcesService from '../services/resources';

const ResourcesContext = createContext(null);

export const ResourcesProvider = ({ children }) => {
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [tips, setTips] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        setLoading(true);
        try {
            // Load public tips (no auth needed)
            const tipsData = await resourcesService.getHealthTips();
            setTips(tipsData.results || tipsData || []);

            // Load challenges (might need auth)
            if (user) {
                const challengesData = await resourcesService.getChallenges();
                setChallenges(challengesData.results || challengesData || []);
            }
        } catch (error) {
            console.error('Failed to load resources:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const joinChallenge = async (id) => {
        try {
            const result = await resourcesService.joinChallenge(id);
            await loadResources(); // Refresh list
            return result;
        } catch (error) {
            console.error('Failed to join challenge:', error);
            throw error;
        }
    };

    const value = {
        articles,
        tips,
        challenges,
        loading,
        error,
        refresh: loadResources,
        joinChallenge
    };

    return (
        <ResourcesContext.Provider value={value}>
            {children}
        </ResourcesContext.Provider>
    );
};

export const useResources = () => {
    const context = useContext(ResourcesContext);
    if (!context) {
        throw new Error('useResources must be used within a ResourcesProvider');
    }
    return context;
};

export default ResourcesProvider;