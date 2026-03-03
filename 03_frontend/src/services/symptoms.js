// src/services/symptoms.js
import api from './api';

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
            // Format the data properly for the backend
            const formattedData = {
                symptom_type: data.symptom_type, // Make sure this matches backend choices
                severity: parseInt(data.severity), // Ensure it's a number
                date: data.date || new Date().toISOString().split('T')[0],
                time: data.time || null,
                notes: data.notes || ''
            };

            console.log('📤 Logging symptom with data:', formattedData);
            const response = await api.logSymptom(formattedData);
            return response;
        } catch (error) {
            console.error('Error logging symptom:', error);
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