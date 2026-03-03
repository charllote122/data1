// src/hooks/useHealth.js
import { useContext } from 'react';
import { HealthContext } from '../context/HealthContext';

export const useHealth = () => {
    const context = useContext(HealthContext);
    if (!context) {
        throw new Error('useHealth must be used within a HealthProvider');
    }
    return context;
};