// src/services/medications.js
import api from './api';

class MedicationsService {
    async getMedications() {
        try {
            const response = await api.getMedications();
            return response;
        } catch (error) {
            console.error('Error fetching medications:', error);
            throw error;
        }
    }

    async createMedication(data) {
        try {
            const response = await api.createMedication(data);
            return response;
        } catch (error) {
            console.error('Error creating medication:', error);
            throw error;
        }
    }

    async updateMedication(id, data) {
        try {
            const response = await api.updateMedication(id, data);
            return response;
        } catch (error) {
            console.error('Error updating medication:', error);
            throw error;
        }
    }

    async deleteMedication(id) {
        try {
            const response = await api.deleteMedication(id);
            return response;
        } catch (error) {
            console.error('Error deleting medication:', error);
            throw error;
        }
    }

    async takeDose(id) {
        try {
            const response = await api.takeDose(id);
            return response;
        } catch (error) {
            console.error('Error taking dose:', error);
            throw error;
        }
    }
}

export default new MedicationsService();