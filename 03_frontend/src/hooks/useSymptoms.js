// src/hooks/useSymptoms.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const useSymptoms = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        const localSymptoms = localStorage.getItem('localSymptoms');
        if (localSymptoms) {
            try {
                const parsed = JSON.parse(localSymptoms);
                if (parsed.length > 0) {
                    setSymptoms(parsed);
                }
            } catch (e) {
                console.error('Error loading from localStorage:', e);
            }
        }
    }, []);

    // Save to localStorage whenever symptoms change
    useEffect(() => {
        if (symptoms.length > 0) {
            localStorage.setItem('localSymptoms', JSON.stringify(symptoms));
        }
    }, [symptoms]);

    // Calculate trends from symptoms
    const calculateTrends = useCallback((symptomList) => {
        if (!symptomList || symptomList.length === 0) return null;

        try {
            const total = symptomList.length;
            
            // Severity distribution
            const severe = symptomList.filter(s => s.severity >= 8).length;
            const moderate = symptomList.filter(s => s.severity >= 5 && s.severity < 8).length;
            const mild = symptomList.filter(s => s.severity < 5).length;
            
            // Average severity
            const avgSeverity = symptomList.reduce((acc, s) => acc + (s.severity || 0), 0) / total;
            
            // Count by type
            const typeCount = {};
            symptomList.forEach(s => {
                const type = s.symptom_type || s.symptom_label || 'Unknown';
                typeCount[type] = (typeCount[type] || 0) + 1;
            });
            
            // Most common symptom
            let mostCommonType = 'None';
            let maxCount = 0;
            Object.entries(typeCount).forEach(([type, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonType = type;
                }
            });

            // By type array for charts
            const byType = Object.entries(typeCount).map(([type, count]) => ({
                symptom_type: type,
                count,
                avg_severity: symptomList
                    .filter(s => (s.symptom_type === type || s.symptom_label === type))
                    .reduce((acc, s) => acc + (s.severity || 0), 0) / count
            }));

            // Recent trend (last 5)
            const recentTrend = symptomList
                .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
                .slice(0, 5)
                .map(s => ({
                    date: s.timestamp || s.created_at,
                    type: s.symptom_type || s.symptom_label,
                    severity: s.severity
                }));

            // Insights
            const insights = [];
            if (severe > 0) {
                insights.push(`You've had ${severe} severe symptom${severe > 1 ? 's' : ''}. Consider consulting your doctor.`);
            }
            if (avgSeverity > 6) {
                insights.push(`Your average symptom severity is ${avgSeverity.toFixed(1)}/10, which is relatively high.`);
            }
            if (mostCommonType !== 'None') {
                insights.push(`Your most common symptom is ${mostCommonType}.`);
            }
            if (symptomList.length > 10) {
                insights.push(`You've logged ${symptomList.length} symptoms. Good job tracking!`);
            }

            return {
                total_logged: total,
                avg_severity: avgSeverity,
                most_common: { type: mostCommonType, count: maxCount },
                by_type: byType,
                recent_trend: recentTrend,
                severity_distribution: { severe, moderate, mild },
                insights,
                trend_percentage: 0
            };
        } catch (error) {
            console.error('Error calculating trends:', error);
            return null;
        }
    }, []);

    // Update trends whenever symptoms change
    useEffect(() => {
        if (symptoms.length > 0) {
            const newTrends = calculateTrends(symptoms);
            setTrends(newTrends);
        } else {
            setTrends(null);
        }
    }, [symptoms, calculateTrends]);

    // ============================================
    // FETCH SYMPTOMS (READ)
    // ============================================
    const fetchSymptoms = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('accessToken');
            
            // Try API first
            try {
                const response = await axios.get(`${API_URL}/symptoms/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                let data = [];
                if (response.data && response.data.results) {
                    data = response.data.results;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                }
                
                if (data.length > 0) {
                    setSymptoms(data);
                    localStorage.setItem('localSymptoms', JSON.stringify(data));
                }
            } catch (apiErr) {
                console.log('Using localStorage symptoms');
                // Already loaded from localStorage in useEffect
            }
            
        } catch (err) {
            console.error('Error in fetchSymptoms:', err);
            setError('Failed to load symptoms');
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // LOG NEW SYMPTOM (CREATE)
    // ============================================
    const logSymptom = useCallback(async (symptomData) => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('📤 Logging symptom:', symptomData);
            
            // Create new symptom object
            const newSymptom = {
                id: Date.now().toString(),
                ...symptomData,
                created_at: new Date().toISOString(),
                local: true
            };
            
            // Update state immediately for UI feedback
            setSymptoms(prev => {
                const updated = [newSymptom, ...prev];
                localStorage.setItem('localSymptoms', JSON.stringify(updated));
                return updated;
            });
            
            toast.success('Symptom logged successfully!');
            return newSymptom;
            
        } catch (err) {
            console.error('Error logging symptom:', err);
            setError(err.message || 'Failed to log symptom');
            toast.error(err.message || 'Failed to log symptom');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // UPDATE SYMPTOM (UPDATE)
    // ============================================
    const updateSymptom = useCallback(async (id, symptomData) => {
        setLoading(true);
        setError(null);
        
        try {
            setSymptoms(prev => {
                const updated = prev.map(s => 
                    s.id === id ? { ...s, ...symptomData } : s
                );
                localStorage.setItem('localSymptoms', JSON.stringify(updated));
                return updated;
            });
            
            toast.success('Symptom updated successfully!');
            return { ...symptomData, id };
            
        } catch (err) {
            console.error('Error updating symptom:', err);
            setError(err.message || 'Failed to update symptom');
            toast.error(err.message || 'Failed to update symptom');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // DELETE SYMPTOM (DELETE)
    // ============================================
    const deleteSymptom = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        
        try {
            setSymptoms(prev => {
                const updated = prev.filter(s => s.id !== id);
                localStorage.setItem('localSymptoms', JSON.stringify(updated));
                return updated;
            });
            
            toast.success('Symptom deleted successfully!');
            
        } catch (err) {
            console.error('Error deleting symptom:', err);
            setError(err.message || 'Failed to delete symptom');
            toast.error(err.message || 'Failed to delete symptom');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================
    // GET SINGLE SYMPTOM (READ)
    // ============================================
    const getSymptom = useCallback(async (id) => {
        try {
            const symptom = symptoms.find(s => s.id === id);
            if (symptom) return symptom;
            throw new Error('Symptom not found');
        } catch (err) {
            console.error('Error getting symptom:', err);
            toast.error(err.message || 'Failed to get symptom');
            throw err;
        }
    }, [symptoms]);

    // ============================================
    // REFRESH SYMPTOMS
    // ============================================
    const refresh = useCallback(async () => {
        await fetchSymptoms();
    }, [fetchSymptoms]);

    return {
        symptoms,
        trends,
        loading,
        error,
        fetchSymptoms,
        logSymptom,
        updateSymptom,
        deleteSymptom,
        getSymptom,
        refresh
    };
};