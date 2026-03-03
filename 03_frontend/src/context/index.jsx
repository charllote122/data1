// src/context/index.jsx
// Export all contexts
export { AuthProvider, useAuth } from './AuthContext';
export { ThemeProvider, useTheme } from './ThemeContext';
export { NotificationProvider, useNotification } from './NotificationContext';
export { HealthProvider, useHealth } from './HealthContext';
export { PredictionProvider, usePredictions } from './PredictionContext';
export { SettingsProvider, useSettings } from './SettingsContext.jsx';  // Added .jsx
export { SymptomsProvider, useSymptoms } from './SymptomsContext';
export { MedicationsProvider, useMedications } from './MedicationsContext';
export { ResourcesProvider, useResources } from './ResourcesContext';

// Combined provider for easy wrapping
import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { HealthProvider } from './HealthContext';
import { PredictionProvider } from './PredictionContext';
import { SettingsProvider } from './SettingsContext.jsx';  // Added .jsx
import { SymptomsProvider } from './SymptomsContext';
import { MedicationsProvider } from './MedicationsContext';
import { ResourcesProvider } from './ResourcesContext';

export const AppProviders = ({ children }) => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <ThemeProvider>
                    <HealthProvider>
                        <PredictionProvider>
                            <MedicationsProvider>
                                <SymptomsProvider>
                                    <ResourcesProvider>
                                        <SettingsProvider>
                                            {children}
                                        </SettingsProvider>
                                    </ResourcesProvider>
                                </SymptomsProvider>
                            </MedicationsProvider>
                        </PredictionProvider>
                    </HealthProvider>
                </ThemeProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};