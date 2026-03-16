// src/services/auth.js
import api from './api';

class AuthService {
    // Register new user
    async register(userData) {
        try {
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
                    message: data.message || data.non_field_errors?.[0] || 'Registration failed'
                };
            }

            // Store token if returned (for auto-login)
            if (data.access) {
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else if (data.token) {
                localStorage.setItem('access_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login user
    async login(credentials) {
        try {
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
                console.log('✅ JWT tokens stored successfully');
            } else if (data.token) {
                localStorage.setItem('access_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('✅ Token stored successfully');
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            const refreshToken = localStorage.getItem('refresh_token');

            // Attempt to notify backend about logout if we have a refresh token
            if (refreshToken) {
                try {
                    await fetch(`${api.baseURL}/auth/logout/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: JSON.stringify({ refresh: refreshToken })
                    });
                } catch (e) {
                    console.warn('Logout API call failed, clearing local storage anyway:', e);
                }
            }
        } finally {
            // Always clear local storage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_id');
            localStorage.removeItem('remaining_predictions');
            console.log('✅ Logged out, localStorage cleared');
        }
    }

    // Refresh access token
    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${api.baseURL}/auth/token/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken })
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.message || 'Token refresh failed'
                };
            }

            if (data.access) {
                localStorage.setItem('access_token', data.access);
                console.log('✅ Token refreshed successfully');
                return data.access;
            }

            return null;
        } catch (error) {
            console.error('Token refresh error:', error);
            // Clear tokens if refresh fails
            this.logout();
            throw error;
        }
    }

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
                return null;
            }
        }
        return null;
    }

    // Get access token
    getToken() {
        return localStorage.getItem('access_token');
    }

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // Check if token is expired
    isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Add 10 second buffer
            return payload.exp * 1000 < Date.now() + 10000;
        } catch {
            return true;
        }
    }

    // Check if user is verified
    isVerified() {
        const user = this.getCurrentUser();
        return user?.is_verified || false;
    }

    // Get user's full name or username
    getUserDisplayName() {
        const user = this.getCurrentUser();
        if (!user) return 'Guest';
        return user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.username || user.email || 'User';
    }

    // Update user in localStorage
    updateUser(userData) {
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
    }
}

export default new AuthService();