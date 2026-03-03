 
// Export all API modules
export { authAPI } from './auth';
export { predictionsAPI } from './predictions';
export { usersAPI } from './users';
export { healthAPI } from './health';
export { analyticsAPI } from './analytics';
export { coachAPI } from './coach';
export { medicationsAPI } from './medications';
export { symptomsAPI } from './symptoms';
export { resourcesAPI } from './resources';

// Create a unified API object
const api = {
    auth: authAPI,
    predictions: predictionsAPI,
    users: usersAPI,
    health: healthAPI,
    analytics: analyticsAPI,
    coach: coachAPI,
    medications: medicationsAPI,
    symptoms: symptomsAPI,
    resources: resourcesAPI,
};

export default api;