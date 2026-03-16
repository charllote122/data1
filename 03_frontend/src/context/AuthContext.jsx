// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const initializeAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (userData, accessToken, refreshToken, remember = false) => {
        setUser(userData);

        // Store tokens based on remember preference
        if (remember) {
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
        } else {
            sessionStorage.setItem('access_token', accessToken);
            sessionStorage.setItem('refresh_token', refreshToken);
        }

        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        setUser(null);

        // Clear all storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');

        // Optional: Call logout API
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};