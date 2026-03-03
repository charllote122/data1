// src/components/Providers.jsx
import React from 'react';
import { AppProviders } from '../context';  // Import the combined provider

export function Providers({ children }) {
    return (
        <AppProviders>
            {children}
        </AppProviders>
    );
}