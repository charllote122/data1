// src/services/medications.js
import api from './api';

class MedicationsService {
    // ============================================
    // API Methods - Using the central api service with correct URLs
    // ============================================

    async getMedications() {
        try {
            console.log('📤 Fetching medications via api service...');
            // Use the correct URL from api.js - /predictions/medications/
            const response = await api.get('/predictions/medications/');
            console.log('📥 Medications response:', response.data);

            // Handle different response formats
            if (response.data && response.data.results) {
                return response.data;
            } else if (Array.isArray(response.data)) {
                return { results: response.data };
            } else {
                return { results: [] };
            }
        } catch (error) {
            console.error('Error fetching medications:', error);
            return { results: [] };
        }
    }

    async getMedication(id) {
        try {
            const response = await api.get(`/predictions/medications/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching medication:', error);
            throw error;
        }
    }

    async createMedication(data) {
        try {
            console.log('📤 Creating medication with data:', data);
            // Use the correct URL from api.js - /predictions/medications/
            const response = await api.post('/predictions/medications/', data);
            console.log('📥 Create response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating medication:', error);
            throw error;
        }
    }

    async updateMedication(id, data) {
        try {
            const response = await api.patch(`/predictions/medications/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating medication:', error);
            throw error;
        }
    }

    async deleteMedication(id) {
        try {
            const response = await api.delete(`/predictions/medications/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error deleting medication:', error);
            throw error;
        }
    }

    async takeDose(id) {
        try {
            const response = await api.post(`/predictions/medications/${id}/take_dose/`, {});
            return response.data;
        } catch (error) {
            console.error('Error taking dose:', error);
            throw error;
        }
    }
}

export default new MedicationsService();