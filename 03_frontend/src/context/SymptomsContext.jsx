// src/context/SymptomsContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Create context
const SymptomsContext = createContext();

// Custom hook to use the context
export const useSymptoms = () => {
    const context = useContext(SymptomsContext);
    if (!context) {
        throw new Error('useSymptoms must be used within a SymptomsProvider');
    }
    return context;
};

// Provider component
export const SymptomsProvider = ({ children }) => {
    const [symptoms, setSymptoms] = useState([]);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ============================================
    // Load from localStorage on mount
    // ============================================
    useEffect(() => {
        const loadLocalSymptoms = () => {
            try {
                const savedSymptoms = localStorage.getItem('symptoms');
                if (savedSymptoms) {
                    const parsed = JSON.parse(savedSymptoms);
                    if (Array.isArray(parsed)) {
                        console.log('📦 Loaded symptoms from localStorage:', parsed.length);
                        setSymptoms(parsed);
                    }
                }
            } catch (error) {
                console.error('Error loading symptoms from localStorage:', error);
            }
        };

        loadLocalSymptoms();
    }, []);

    // ============================================
    // Save to localStorage whenever symptoms change
    // ============================================
    useEffect(() => {
        if (symptoms.length > 0) {
            localStorage.setItem('symptoms', JSON.stringify(symptoms));
            console.log('💾 Saved symptoms to localStorage:', symptoms.length);
        } else {
            localStorage.removeItem('symptoms');
        }
    }, [symptoms]);

    // ============================================
    // Calculate trends from symptoms
    // ============================================
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
                const type = s.symptom_label || s.symptom_type || 'Unknown';
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
                    .filter(s => (s.symptom_label === type || s.symptom_type === type))
                    .reduce((acc, s) => acc + (s.severity || 0), 0) / count
            }));

            // Recent trend (last 5)
            const recentTrend = [...symptomList]
                .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
                .slice(0, 5)
                .map(s => ({
                    date: s.timestamp || s.created_at,
                    type: s.symptom_label || s.symptom_type,
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
                insights.push(`You've logged ${symptomList.length} symptoms. Keep tracking!`);
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
    // LOG NEW SYMPTOM (CREATE)
    // ============================================
    const logSymptom = useCallback(async (symptomData) => {
        setLoading(true);
        setError(null);

        try {
            console.log('📤 Logging symptom:', symptomData);

            // Symptom type mapping
            const symptomTypes = {
                headache: { label: 'Headache', emoji: '🤕' },
                fatigue: { label: 'Fatigue', emoji: '😴' },
                thirst: { label: 'Excessive Thirst', emoji: '🥤' },
                urination: { label: 'Frequent Urination', emoji: '🚽' },
                blurred_vision: { label: 'Blurred Vision', emoji: '👓' },
                nausea: { label: 'Nausea', emoji: '🤢' },
                dizziness: { label: 'Dizziness', emoji: '😵' },
                weakness: { label: 'Weakness', emoji: '😓' },
                numbness: { label: 'Numbness', emoji: '🦶' },
                chest_pain: { label: 'Chest Pain', emoji: '💔' },
                shortness_breath: { label: 'Shortness of Breath', emoji: '🫁' },
                high_blood_sugar: { label: 'High Blood Sugar', emoji: '📈' },
                low_blood_sugar: { label: 'Low Blood Sugar', emoji: '📉' },
                other: { label: 'Other', emoji: '🔍' }
            };

            const selectedType = symptomTypes[symptomData.symptom_type] || {
                label: symptomData.symptom_type || 'Unknown',
                emoji: '🔍'
            };

            // Create timestamp
            let timestamp;
            if (symptomData.date) {
                if (symptomData.time) {
                    timestamp = new Date(`${symptomData.date}T${symptomData.time}:00`).toISOString();
                } else {
                    timestamp = new Date(`${symptomData.date}T12:00:00`).toISOString();
                }
            } else {
                timestamp = new Date().toISOString();
            }

            // Create new symptom object
            const newSymptom = {
                id: `symptom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                symptom_type: symptomData.symptom_type,
                symptom_label: selectedType.label,
                emoji: selectedType.emoji,
                severity: parseInt(symptomData.severity) || 5,
                timestamp: timestamp,
                date: symptomData.date || new Date().toISOString().split('T')[0],
                time: symptomData.time || '12:00',
                duration: symptomData.duration || '',
                notes: symptomData.notes || '',
                created_at: new Date().toISOString()
            };

            console.log('✅ Created new symptom:', newSymptom);

            // Update state
            setSymptoms(prev => {
                const updated = [newSymptom, ...prev];
                // Sort by timestamp (newest first)
                updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                return updated;
            });

            toast.success('✅ Symptom logged successfully!');
            return newSymptom;

        } catch (err) {
            console.error('❌ Error logging symptom:', err);
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
                return updated;
            });

            toast.success('✅ Symptom updated successfully!');
            return { ...symptomData, id };

        } catch (err) {
            console.error('❌ Error updating symptom:', err);
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
                return updated;
            });

            toast.success('✅ Symptom deleted successfully!');

        } catch (err) {
            console.error('❌ Error deleting symptom:', err);
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
            console.error('❌ Error getting symptom:', err);
            toast.error(err.message || 'Failed to get symptom');
            throw err;
        }
    }, [symptoms]);

    // ============================================
    // REFRESH SYMPTOMS
    // ============================================
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            // Reload from localStorage
            const savedSymptoms = localStorage.getItem('symptoms');
            if (savedSymptoms) {
                setSymptoms(JSON.parse(savedSymptoms));
                toast.success('Symptoms refreshed');
            }
        } catch (err) {
            console.error('Error refreshing:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Context value
    const value = {
        symptoms,
        trends,
        loading,
        error,
        logSymptom,
        updateSymptom,
        deleteSymptom,
        getSymptom,
        refresh
    };

    return (
        <SymptomsContext.Provider value={value}>
            {children}
        </SymptomsContext.Provider>
    );
};