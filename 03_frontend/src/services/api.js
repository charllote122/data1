// src/services/api.js
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        this.sessionId = localStorage.getItem('session_id') || this.generateSessionId();

        console.log('🔌 API Service initialized with baseURL:', this.baseURL);
    }

    generateSessionId() {
        const sessionId = 'anon_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('session_id', sessionId);
        return sessionId;
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (includeAuth) {
            const token = localStorage.getItem('access_token');
            console.log('🔑 Getting token for auth request:', token ? 'Token exists' : 'NO TOKEN FOUND');

            if (token) {
                console.log('✅ Token present (first 20 chars):', token.substring(0, 20) + '...');
                headers['Authorization'] = `Bearer ${token}`; // Using Bearer for JWT
            } else {
                console.warn('⚠️ No token found in localStorage for authenticated request');
                console.log('localStorage keys:', Object.keys(localStorage));
            }
        } else {
            console.log('🔓 Request without auth');
            headers['X-Session-ID'] = this.sessionId;
        }

        return headers;
    }

    async handleResponse(response) {
        const contentType = response.headers.get('content-type');

        // Check if response is HTML (usually means 404 or server error)
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            console.error('❌ Received HTML instead of JSON. URL:', response.url);
            console.error('Status:', response.status);
            console.error('HTML Preview:', text.substring(0, 500));

            throw {
                status: response.status,
                message: `Server returned HTML (Status ${response.status}). Make sure Django server is running.`,
                isHtmlError: true,
                html: text.substring(0, 500)
            };
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            const text = await response.text();
            console.error('❌ Failed to parse JSON response:', e);
            console.error('Raw response:', text.substring(0, 500));
            throw {
                status: response.status,
                message: 'Invalid JSON response from server',
                error: e.message,
                rawResponse: text.substring(0, 500)
            };
        }

        if (!response.ok) {
            // Handle rate limiting (429)
            if (response.status === 429) {
                throw {
                    status: 429,
                    message: data.message || data.error || 'Rate limit exceeded',
                    requires_signup: data.requires_signup || true,
                    ...data
                };
            }

            // Handle unauthorized
            if (response.status === 401) {
                console.warn('⚠️ Received 401 Unauthorized - checking token');
                // Try to refresh token if we have a refresh token
                const refreshToken = localStorage.getItem('refresh_token');
                if (refreshToken) {
                    console.log('🔄 Attempting to refresh token...');
                    // You might want to implement token refresh here
                    // For now, just clear tokens
                }
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                throw {
                    status: 401,
                    message: data.message || 'Session expired',
                    ...data
                };
            }

            // Handle validation errors
            if (response.status === 400) {
                console.error('❌ Validation error details:', data);
                throw {
                    status: 400,
                    errors: data,
                    message: data.message || 'Validation failed',
                    details: data
                };
            }

            // Handle server errors
            if (response.status >= 500) {
                throw {
                    status: response.status,
                    message: data.message || data.error || 'Server error occurred',
                    error_code: data.error_code
                };
            }

            throw {
                status: response.status,
                message: data.message || data.error || 'Request failed',
                ...data
            };
        }

        return data;
    }

    // ========== PREDICTION ENDPOINTS ==========

    // Get all predictions / Create prediction
    async predictions(data = null, method = 'GET') {
        const url = `${this.baseURL}/predictions/predictions/`;
        console.log('📤 Predictions request to:', url, method);

        const options = {
            method: method,
            headers: this.getHeaders(true),
            ...(data && { body: JSON.stringify(data) })
        };
        const response = await fetch(url, options);
        return this.handleResponse(response);
    }

    // Get single prediction
    async getPrediction(id) {
        const url = `${this.baseURL}/predictions/predictions/${id}/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // Delete prediction
    async deletePrediction(id) {
        const url = `${this.baseURL}/predictions/predictions/${id}/`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== PUBLIC PREDICTION ENDPOINTS ==========

    // Public prediction (no auth, rate limited)
    async publicPredict(data) {
        const url = `${this.baseURL}/predictions/public/predict/`;

        console.log('='.repeat(80));
        console.log('📤 PUBLIC PREDICTION REQUEST');
        console.log('='.repeat(80));
        console.log('URL:', url);
        console.log('Original data received:', JSON.stringify(data, null, 2));

        // Ensure data has correct field names and types
        const formattedData = {
            HighBP: data.HighBP !== undefined ? Number(data.HighBP) : 0,
            HighChol: data.HighChol !== undefined ? Number(data.HighChol) : 0,
            BMI: data.BMI !== undefined ? Number(data.BMI) : 25,
            Smoker: data.Smoker !== undefined ? Number(data.Smoker) : 0,
            Stroke: data.Stroke !== undefined ? Number(data.Stroke) : 0,
            HeartDiseaseorAttack: data.HeartDiseaseorAttack !== undefined ? Number(data.HeartDiseaseorAttack) : 0,
            PhysActivity: data.PhysActivity !== undefined ? Number(data.PhysActivity) : 1,
            Fruits: data.Fruits !== undefined ? Number(data.Fruits) : 1,
            Veggies: data.Veggies !== undefined ? Number(data.Veggies) : 1,
            HvyAlcoholConsump: data.HvyAlcoholConsump !== undefined ? Number(data.HvyAlcoholConsump) : 0,
            AnyHealthcare: data.AnyHealthcare !== undefined ? Number(data.AnyHealthcare) : 1,
            NoDocbcCost: data.NoDocbcCost !== undefined ? Number(data.NoDocbcCost) : 0,
            GenHlth: data.GenHlth !== undefined ? Number(data.GenHlth) : 3,
            MentHlth: data.MentHlth !== undefined ? Number(data.MentHlth) : 0,
            PhysHlth: data.PhysHlth !== undefined ? Number(data.PhysHlth) : 0,
            DiffWalk: data.DiffWalk !== undefined ? Number(data.DiffWalk) : 0,
            Sex: data.Sex !== undefined ? Number(data.Sex) : 0,
            Age: data.Age !== undefined ? Number(data.Age) : 45,
            Education: data.Education !== undefined ? Number(data.Education) : 4,
            Income: data.Income !== undefined ? Number(data.Income) : 5
        };

        console.log('\n📤 Formatted data:', JSON.stringify(formattedData, null, 2));
        console.log('\n📤 Headers:', this.getHeaders(false));

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(false),
                body: JSON.stringify(formattedData),
                credentials: 'include'
            });

            console.log('\n📥 Response status:', response.status);

            const responseText = await response.text();
            console.log('📥 Raw response:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('❌ Failed to parse response as JSON:', responseText.substring(0, 500));
                throw {
                    status: response.status,
                    message: 'Invalid JSON response',
                    rawResponse: responseText.substring(0, 500)
                };
            }

            if (!response.ok) {
                console.error('❌ Error response:', result);
                throw {
                    status: response.status,
                    errors: result,
                    message: result.message || 'Request failed',
                    ...result
                };
            }

            console.log('📥 Success response:', result);

            // Track session info if provided
            if (result.meta?.session_id) {
                localStorage.setItem('session_id', result.meta.session_id);
            }
            if (result.meta?.remaining_attempts !== undefined) {
                localStorage.setItem('remaining_predictions', result.meta.remaining_attempts);
            }

            return result;

        } catch (error) {
            console.error('❌ Fetch error:', error);
            throw error;
        }
    }

    // Public health tips
    async getPublicTips() {
        const url = `${this.baseURL}/predictions/public/tips/`;
        const response = await fetch(url, {
            headers: this.getHeaders(false),
            credentials: 'include'
        });
        return this.handleResponse(response);
    }

    // Public dashboard preview
    async getPublicDashboard() {
        const url = `${this.baseURL}/predictions/public/dashboard/`;
        const response = await fetch(url, {
            headers: this.getHeaders(false)
        });
        return this.handleResponse(response);
    }

    // ========== FEATURE INFO ==========
    async getFeatureInfo() {
        const url = `${this.baseURL}/predictions/features/`;
        console.log('📤 Fetching feature info from:', url);

        const response = await fetch(url, {
            headers: this.getHeaders(false),
            credentials: 'include'
        });

        const data = await this.handleResponse(response);
        console.log('📥 Feature info response:', data);
        return data;
    }

    // ========== AUTHENTICATED PREDICTION ACTIONS ==========

    async getMyPredictions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}/predictions/predictions/my_predictions/?${queryString}`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async getPredictionExplanation(id) {
        const url = `${this.baseURL}/predictions/predictions/${id}/explain/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async submitPredictionFeedback(id, feedback) {
        const url = `${this.baseURL}/predictions/predictions/${id}/feedback/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(feedback)
        });
        return this.handleResponse(response);
    }

    async getPredictionTrends() {
        const url = `${this.baseURL}/predictions/predictions/trends/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async runSimulation(data) {
        const url = `${this.baseURL}/predictions/predictions/simulate/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async getDashboard() {
        const url = `${this.baseURL}/predictions/predictions/dashboard/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== HEALTH PROFILE ENDPOINTS ==========

    async getHealthProfile() {
        const url = `${this.baseURL}/predictions/health/profile/`;
        console.log('📤 Fetching health profile from:', url);
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async updateHealthProfile(data) {
        const url = `${this.baseURL}/predictions/health/profile/`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateHealthMetrics(data) {
        const url = `${this.baseURL}/predictions/health/metrics/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async getHealthHistory() {
        const url = `${this.baseURL}/predictions/health/history/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== GOALS ENDPOINTS ==========

    async getGoals() {
        const url = `${this.baseURL}/predictions/goals/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async createGoal(data) {
        const url = `${this.baseURL}/predictions/goals/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateGoalProgress(id, value) {
        const url = `${this.baseURL}/predictions/goals/${id}/update_progress/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ value })
        });
        return this.handleResponse(response);
    }

    async deleteGoal(id) {
        const url = `${this.baseURL}/predictions/goals/${id}/`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== MEDICATIONS ENDPOINTS ==========

    async getMedications() {
        const url = `${this.baseURL}/predictions/medications/`;
        console.log('📤 Fetching medications from:', url);
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async createMedication(data) {
        const url = `${this.baseURL}/predictions/medications/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateMedication(id, data) {
        const url = `${this.baseURL}/predictions/medications/${id}/`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteMedication(id) {
        const url = `${this.baseURL}/predictions/medications/${id}/`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async takeDose(id) {
        const url = `${this.baseURL}/predictions/medications/${id}/take_dose/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== SYMPTOMS ENDPOINTS ==========

    async getSymptoms() {
        const url = `${this.baseURL}/predictions/symptoms/`;
        console.log('📤 Fetching symptoms from:', url);
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async logSymptom(data) {
        const url = `${this.baseURL}/predictions/symptoms/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateSymptom(id, data) {
        const url = `${this.baseURL}/predictions/symptoms/${id}/`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteSymptom(id) {
        const url = `${this.baseURL}/predictions/symptoms/${id}/`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async getSymptomTrends() {
        const url = `${this.baseURL}/predictions/symptoms/trends/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== CHALLENGES ENDPOINTS ==========

    async getChallenges() {
        const url = `${this.baseURL}/predictions/challenges/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async joinChallenge(id) {
        const url = `${this.baseURL}/predictions/challenges/${id}/join/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async leaveChallenge(id) {
        const url = `${this.baseURL}/predictions/challenges/${id}/leave/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async getMyChallenges() {
        const url = `${this.baseURL}/predictions/challenges/my_challenges/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== ANALYTICS ENDPOINTS ==========

    async getAnalyticsSummary() {
        const url = `${this.baseURL}/predictions/analytics/summary/`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async exportData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}/predictions/export/?${queryString}`;
        const response = await fetch(url, {
            headers: this.getHeaders(true)
        });

        if (params.format === 'csv') {
            return response.blob();
        }
        return this.handleResponse(response);
    }

    // ========== AUTH ENDPOINTS ==========

    async login(credentials) {
        const url = `${this.baseURL}/auth/login/`;
        console.log('📤 Login to:', url);
        console.log('📤 Credentials:', { ...credentials, password: '***' });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await this.handleResponse(response);
        console.log('✅ Login response received');

        // Store JWT tokens
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('✅ JWT tokens stored in localStorage');
        } else {
            console.warn('⚠️ No access token in login response');
        }

        return data;
    }

    async register(userData) {
        const url = `${this.baseURL}/auth/register/`;
        console.log('📤 Register to:', url);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await this.handleResponse(response);

        // Store JWT tokens if returned (for auto-login)
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('✅ JWT tokens stored from registration');
        }

        return data;
    }

    async logout(refreshToken = null) {
        const url = `${this.baseURL}/auth/logout/`;
        try {
            const token = refreshToken || localStorage.getItem('refresh_token');
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(true),
                body: token ? JSON.stringify({ refresh: token }) : undefined
            });
            return await this.handleResponse(response);
        } finally {
            // Always clear local storage even if API call fails
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('session_id');
            localStorage.removeItem('remaining_predictions');
            console.log('✅ Logged out, localStorage cleared');
        }
    }

    async refreshToken(refresh) {
        const url = `${this.baseURL}/auth/token/refresh/`;
        console.log('🔄 Refreshing token...');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refresh || localStorage.getItem('refresh_token') })
        });

        const data = await this.handleResponse(response);

        if (data.access) {
            localStorage.setItem('access_token', data.access);
            console.log('✅ Token refreshed successfully');
        }

        return data;
    }

    async forgotPassword(email) {
        const url = `${this.baseURL}/auth/password-reset/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return this.handleResponse(response);
    }

    async resetPassword(token, password) {
        const url = `${this.baseURL}/auth/password-reset/confirm/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });
        return this.handleResponse(response);
    }

    async changePassword(passwordData) {
        const url = `${this.baseURL}/auth/change-password/`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(passwordData)
        });

        const data = await this.handleResponse(response);

        // If password change returns new tokens, store them
        if (data.access) {
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            console.log('✅ New tokens stored after password change');
        }

        return data;
    }

    // ========== UTILITY METHODS ==========

    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/api/health/`);
            const data = await response.json();
            console.log('✅ API Connection test passed:', data);
            return { success: true, data };
        } catch (error) {
            console.error('❌ API Connection test failed:', error);
            return {
                success: false,
                error: error.message,
                message: 'Cannot connect to backend. Please ensure Django server is running on port 8000'
            };
        }
    }

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

    isAuthenticated() {
        return !!localStorage.getItem('access_token');
    }
}

export default new ApiService();