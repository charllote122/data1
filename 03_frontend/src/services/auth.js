// src/services/auth.js
import api from './api';

class AuthService {
    // Register new user
    async register(userData) {
        const response = await fetch(`${api.baseURL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                errors: data,
                message: data.message || 'Registration failed'
            };
        }

        // Store token if returned (for auto-login)
        if (data.token) {
            localStorage.setItem('access_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    // Login user
    async login(credentials) {
        const response = await fetch(`${api.baseURL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle the specific non_field_errors from Django REST framework
            const errorMessage = data.non_field_errors
                ? data.non_field_errors[0]
                : data.message || 'Login failed';

            throw {
                status: response.status,
                errors: data,
                message: errorMessage
            };
        }

        // Store tokens and user data
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
        } else if (data.token) {
            localStorage.setItem('access_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    }

    // Logout user
    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('session_id');
        localStorage.removeItem('remaining_predictions');
    }

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }

    // Get token
    getToken() {
        return localStorage.getItem('access_token');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Check if user is verified
    isVerified() {
        const user = this.getCurrentUser();
        return user?.is_verified || false;
    }
}

export default new AuthService();