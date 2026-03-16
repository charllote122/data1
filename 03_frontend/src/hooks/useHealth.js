// src/hooks/useHealth.js
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import api from '../services/api';

export const useHealth = () => {
    const { user } = useAuth();
    const [familyHistory, setFamilyHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load family history on mount if user is authenticated
    useEffect(() => {
        if (user) {
            fetchFamilyHistory();
        }
    }, [user]);

    // FETCH all family members
    const fetchFamilyHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/predictions/family-history/');

            if (response.data) {
                const members = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

                setFamilyHistory(members);
                return { success: true, data: members };
            }
            return { success: true, data: [] };
        } catch (err) {
            console.error('Error fetching family history:', err);
            const errorMessage = err.message || err.response?.data?.message || 'Failed to fetch family history';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // GET single family member
    const getFamilyMember = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/predictions/family-history/${id}/`);

            if (response.data) {
                return { success: true, data: response.data };
            }
            return { success: false, error: 'Family member not found' };
        } catch (err) {
            console.error('Error fetching family member:', err);
            const errorMessage = err.message || err.response?.data?.message || 'Failed to fetch family member';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // CREATE family member
    const addFamilyHistory = useCallback(async (memberData) => {
        setLoading(true);
        setError(null);
        try {
            const riskLevel = getRiskLevel(memberData.condition);

            const payload = {
                ...memberData,
                risk: riskLevel,
                genetic_risk_score: calculateGeneticRisk(memberData),
                user_id: user?.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const response = await api.post('/predictions/family-history/', payload);

            if (response.data) {
                setFamilyHistory(prev => [response.data, ...prev]);
                return {
                    success: true,
                    data: response.data,
                    message: 'Family member added successfully'
                };
            }
            return { success: false, error: 'Failed to add family member' };
        } catch (err) {
            console.error('Error adding family member:', err);

            if (err.errors) {
                const validationErrors = Object.values(err.errors).flat().join(', ');
                setError(validationErrors);
                return { success: false, error: validationErrors, details: err.errors };
            }

            const errorMessage = err.message || err.response?.data?.message || 'Failed to add family member';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [user]);

    // UPDATE family member
    const updateFamilyMember = useCallback(async (id, memberData) => {
        setLoading(true);
        setError(null);
        try {
            const riskLevel = getRiskLevel(memberData.condition);

            const payload = {
                ...memberData,
                risk: riskLevel,
                genetic_risk_score: calculateGeneticRisk(memberData),
                updated_at: new Date().toISOString()
            };

            const response = await api.patch(`/predictions/family-history/${id}/`, payload);

            if (response.data) {
                setFamilyHistory(prev =>
                    prev.map(member => member.id === id ? response.data : member)
                );

                return {
                    success: true,
                    data: response.data,
                    message: 'Family member updated successfully'
                };
            }
            return { success: false, error: 'Failed to update family member' };
        } catch (err) {
            console.error('Error updating family member:', err);

            if (err.errors) {
                const validationErrors = Object.values(err.errors).flat().join(', ');
                setError(validationErrors);
                return { success: false, error: validationErrors, details: err.errors };
            }

            const errorMessage = err.message || err.response?.data?.message || 'Failed to update family member';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // DELETE family member
    const deleteFamilyMember = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/predictions/family-history/${id}/`);

            setFamilyHistory(prev => prev.filter(member => member.id !== id));

            return {
                success: true,
                message: 'Family member deleted successfully'
            };
        } catch (err) {
            console.error('Error deleting family member:', err);
            const errorMessage = err.message || err.response?.data?.message || 'Failed to delete family member';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // BULK DELETE family members
    const bulkDeleteFamilyMembers = useCallback(async (ids) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/predictions/family-history/bulk-delete/', { ids });

            setFamilyHistory(prev => prev.filter(member => !ids.includes(member.id)));

            return {
                success: true,
                message: `${ids.length} members deleted successfully`
            };
        } catch (err) {
            console.error('Error bulk deleting family members:', err);
            const errorMessage = err.message || err.response?.data?.message || 'Failed to delete members';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Helper function to get risk level from condition
    const getRiskLevel = (condition) => {
        const riskMap = {
            diabetes_t1: 'high',
            diabetes_t2: 'high',
            gestational: 'moderate',
            heart_disease: 'high',
            hypertension: 'moderate',
            stroke: 'high',
            obesity: 'moderate',
            kidney_disease: 'high'
        };
        return riskMap[condition] || 'low';
    };

    // Helper function to calculate genetic risk score
    const calculateGeneticRisk = (data) => {
        let score = 0;

        const conditionRisk = getRiskLevel(data.condition);
        if (conditionRisk === 'high') score += 40;
        if (conditionRisk === 'moderate') score += 20;

        if (['parent', 'child', 'sibling'].includes(data.relationship)) score += 30;
        if (['grandparent'].includes(data.relationship)) score += 15;

        if (data.age_at_diagnosis && data.age_at_diagnosis < 40) score += 20;
        else if (data.age_at_diagnosis && data.age_at_diagnosis < 60) score += 10;

        if (data.genetic_testing && data.genetic_markers) score += 25;

        return Math.min(100, score);
    };

    return {
        familyHistory,
        loading,
        error,
        fetchFamilyHistory,
        getFamilyMember,
        addFamilyHistory,
        updateFamilyMember,
        deleteFamilyMember,
        bulkDeleteFamilyMembers
    };
};