// src/services/symptoms.js
import api from './api';  // ✅ Import the default instance

class SymptomsService {
    async getSymptoms() {
        try {
            const response = await api.getSymptoms();
            return response;
        } catch (error) {
            console.error('Error fetching symptoms:', error);
            throw error;
        }
    }

    async logSymptom(data) {
        try {
            const response = await api.logSymptom(data);
            return response;
        } catch (error) {
            console.error('Error logging symptom:', error);
            throw error;
        }
    }

    async updateSymptom(id, data) {
        try {
            const response = await api.updateSymptom(id, data);
            return response;
        } catch (error) {
            console.error('Error updating symptom:', error);
            throw error;
        }
    }

    async deleteSymptom(id) {
        try {
            const response = await api.deleteSymptom(id);
            return response;
        } catch (error) {
            console.error('Error deleting symptom:', error);
            throw error;
        }
    }

    async getSymptomTrends() {
        try {
            const response = await api.getSymptomTrends();
            return response;
        } catch (error) {
            console.error('Error fetching symptom trends:', error);
            throw error;
        }
    }
}

export default new SymptomsService();