// src/services/goals.js
import api from './api';

class GoalsService {
    async getGoals() {
        try {
            const response = await api.getGoals();
            return response;
        } catch (error) {
            console.error('Error fetching goals:', error);
            throw error;
        }
    }

    async createGoal(data) {
        try {
            const response = await api.createGoal(data);
            return response;
        } catch (error) {
            console.error('Error creating goal:', error);
            throw error;
        }
    }

    async updateGoalProgress(id, value) {
        try {
            const response = await api.updateGoalProgress(id, value);
            return response;
        } catch (error) {
            console.error('Error updating goal progress:', error);
            throw error;
        }
    }

    async deleteGoal(id) {
        try {
            const response = await api.deleteGoal(id);
            return response;
        } catch (error) {
            console.error('Error deleting goal:', error);
            throw error;
        }
    }
}

export default new GoalsService();