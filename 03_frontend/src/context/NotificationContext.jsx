// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

// ✅ This should be useNotification (singular)
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((type, message, duration = 5000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, message }]);

        if (duration > 0) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, duration);
        }
    }, []);

    const hideNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const value = {
        notifications,
        showNotification,
        hideNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// ✅ Add default export for consistency
export default NotificationProvider;