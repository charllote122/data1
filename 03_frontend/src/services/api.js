// src/services/api.js
class ApiService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        this.sessionId = localStorage.getItem('session_id') || this.generateSessionId();
        this.refreshPromise = null; // For preventing multiple refresh calls

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
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                console.warn('⚠️ No token found in localStorage for authenticated request');
            }
        } else {
            headers['X-Session-ID'] = this.sessionId;
        }

        return headers;
    }

    // Check if token is expired
    isTokenExpired(token) {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Add 10 second buffer to avoid edge cases
            return payload.exp * 1000 < Date.now() + 10000;
        } catch {
            return true;
        }
    }

    // Refresh the access token
    async refreshAccessToken() {
        // If already refreshing, return the existing promise
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = new Promise(async (resolve, reject) => {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                reject(new Error('No refresh token available'));
                return;
            }

            try {
                console.log('🔄 Attempting to refresh token...');
                const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: refreshToken })
                });

                if (!response.ok) {
                    throw new Error('Token refresh failed');
                }

                const data = await response.json();

                if (data.access) {
                    localStorage.setItem('access_token', data.access);
                    console.log('✅ Token refreshed successfully');
                    resolve(data.access);
                } else {
                    throw new Error('No access token in response');
                }
            } catch (error) {
                console.error('❌ Token refresh error:', error);
                // Clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');

                // Only redirect if we're not already on the login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                reject(error);
            } finally {
                this.refreshPromise = null;
            }
        });

        return this.refreshPromise;
    }

    // Main request method with token refresh logic
    async request(url, options = {}, retryCount = 0) {
        const maxRetries = 1;

        try {
            // Check if token is expired before making request
            const token = localStorage.getItem('access_token');
            if (token && this.isTokenExpired(token) && !url.includes('/auth/token/refresh/')) {
                console.log('⏰ Token expired, refreshing before request...');
                await this.refreshAccessToken();
                // Update headers with new token
                options.headers = options.headers || {};
                options.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
            }

            const response = await fetch(url, options);

            // Handle 401 Unauthorized - try to refresh token once
            if (response.status === 401 && retryCount < maxRetries && !url.includes('/auth/token/refresh/')) {
                console.log('🔄 Received 401, attempting token refresh...');

                try {
                    const newToken = await this.refreshAccessToken();

                    // Update authorization header with new token
                    options.headers = options.headers || {};
                    options.headers['Authorization'] = `Bearer ${newToken}`;

                    // Retry the request
                    console.log('🔄 Retrying original request with new token...');
                    return this.request(url, options, retryCount + 1);
                } catch (refreshError) {
                    console.error('❌ Token refresh failed:', refreshError);
                    throw refreshError;
                }
            }

            return response;
        } catch (error) {
            console.error('❌ Request error:', error);
            throw error;
        }
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

    // ========== AUTH ENDPOINTS ==========

    async login(credentials) {
        const url = `${this.baseURL}/auth/login/`;
        console.log('📤 Login to:', url);

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

    // ========== AI ENDPOINTS ==========

    async sendChatMessage(message) {
        const url = `${this.baseURL}/ai/chat/`;
        console.log('📤 Sending chat message to:', url);

        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ message })
        });

        return this.handleResponse(response);
    }

    async getChatHistory() {
        const url = `${this.baseURL}/ai/chat/history/`;
        console.log('📤 Fetching chat history from:', url);

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    async generateMealPlan(preferences) {
        const url = `${this.baseURL}/ai/meal-plan/`;
        console.log('📤 Generating meal plan at:', url);

        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ preferences })
        });

        return this.handleResponse(response);
    }

    async analyzeSymptoms(symptoms, duration) {
        const url = `${this.baseURL}/ai/analyze-symptoms/`;
        console.log('📤 Analyzing symptoms at:', url);

        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ symptoms, duration })
        });

        return this.handleResponse(response);
    }

    // ========== PREDICTION ENDPOINTS ==========

    async predictions(data = null, method = 'GET') {
        const url = `${this.baseURL}/predictions/predictions/`;
        console.log('📤 Predictions request to:', url, method);

        const options = {
            method: method,
            headers: this.getHeaders(true),
            ...(data && { body: JSON.stringify(data) })
        };
        const response = await this.request(url, options);
        return this.handleResponse(response);
    }

    async getPrediction(id) {
        const url = `${this.baseURL}/predictions/predictions/${id}/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async deletePrediction(id) {
        const url = `${this.baseURL}/predictions/predictions/${id}/`;
        const response = await this.request(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== PUBLIC PREDICTION ENDPOINTS ==========

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

    async getPublicTips() {
        const url = `${this.baseURL}/predictions/public/tips/`;
        const response = await fetch(url, {
            headers: this.getHeaders(false),
            credentials: 'include'
        });
        return this.handleResponse(response);
    }

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

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    async getPredictionExplanation(id) {
        const url = `${this.baseURL}/predictions/predictions/${id}/explain/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async submitPredictionFeedback(id, feedback) {
        const url = `${this.baseURL}/predictions/predictions/${id}/feedback/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(feedback)
        });
        return this.handleResponse(response);
    }

    async getPredictionTrends() {
        const url = `${this.baseURL}/predictions/predictions/trends/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async getPredictionStats() {
        const url = `${this.baseURL}/predictions/predictions/stats/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async runSimulation(data) {
        const url = `${this.baseURL}/predictions/predictions/simulate/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async getDashboard() {
        const url = `${this.baseURL}/predictions/predictions/dashboard/`;

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    // ========== HEALTH PROFILE ENDPOINTS ==========

    async getHealthProfile() {
        const url = `${this.baseURL}/predictions/health/profile/`;
        console.log('📤 Fetching health profile from:', url);

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    async updateHealthProfile(data) {
        const url = `${this.baseURL}/predictions/health/profile/`;
        const response = await this.request(url, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateHealthMetrics(data) {
        const url = `${this.baseURL}/predictions/health/metrics/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async getHealthHistory() {
        const url = `${this.baseURL}/predictions/health/history/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== GOALS ENDPOINTS ==========

    async getGoals() {
        const url = `${this.baseURL}/predictions/goals/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async createGoal(data) {
        const url = `${this.baseURL}/predictions/goals/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateGoalProgress(id, value) {
        const url = `${this.baseURL}/predictions/goals/${id}/update_progress/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ value })
        });
        return this.handleResponse(response);
    }

    async deleteGoal(id) {
        const url = `${this.baseURL}/predictions/goals/${id}/`;
        const response = await this.request(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== MEDICATIONS ENDPOINTS ==========

    async getMedications() {
        const url = `${this.baseURL}/predictions/medications/`;
        console.log('📤 Fetching medications from:', url);

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    async createMedication(data) {
        const url = `${this.baseURL}/predictions/medications/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateMedication(id, data) {
        const url = `${this.baseURL}/predictions/medications/${id}/`;
        const response = await this.request(url, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteMedication(id) {
        const url = `${this.baseURL}/predictions/medications/${id}/`;
        const response = await this.request(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async takeDose(id) {
        const url = `${this.baseURL}/predictions/medications/${id}/take_dose/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== SYMPTOMS ENDPOINTS ==========

    async getSymptoms() {
        const url = `${this.baseURL}/predictions/symptoms/`;
        console.log('📤 Fetching symptoms from:', url);

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    async logSymptom(data) {
        const url = `${this.baseURL}/predictions/symptoms/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async updateSymptom(id, data) {
        const url = `${this.baseURL}/predictions/symptoms/${id}/`;
        const response = await this.request(url, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });
        return this.handleResponse(response);
    }

    async deleteSymptom(id) {
        const url = `${this.baseURL}/predictions/symptoms/${id}/`;
        const response = await this.request(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async getSymptomTrends() {
        const url = `${this.baseURL}/predictions/symptoms/trends/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== CHALLENGES ENDPOINTS ==========

    async getChallenges() {
        const url = `${this.baseURL}/predictions/challenges/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async joinChallenge(id) {
        const url = `${this.baseURL}/predictions/challenges/${id}/join/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async leaveChallenge(id) {
        const url = `${this.baseURL}/predictions/challenges/${id}/leave/`;
        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async getMyChallenges() {
        const url = `${this.baseURL}/predictions/challenges/my_challenges/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    // ========== ANALYTICS ENDPOINTS ==========

    async getAnalyticsSummary() {
        const url = `${this.baseURL}/predictions/analytics/summary/`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });
        return this.handleResponse(response);
    }

    async exportData(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.baseURL}/predictions/export/?${queryString}`;
        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        if (params.format === 'csv' || params.format === 'pdf') {
            return response.blob();
        }
        return this.handleResponse(response);
    }

    // ========== FAMILY HISTORY ENDPOINTS ==========

    // Get all family members
    async getFamilyHistory() {
        const url = `${this.baseURL}/predictions/family-history/`;
        console.log('📤 Fetching family history from:', url);

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    // Get single family member
    async getFamilyMember(id) {
        const url = `${this.baseURL}/predictions/family-history/${id}/`;
        console.log('📤 Fetching family member from:', url);

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    // Create family member
    async createFamilyMember(data) {
        const url = `${this.baseURL}/predictions/family-history/`;
        console.log('📤 Creating family member:', data);

        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });

        return this.handleResponse(response);
    }

    // Update family member
    async updateFamilyMember(id, data) {
        const url = `${this.baseURL}/predictions/family-history/${id}/`;
        console.log('📤 Updating family member:', id, data);

        const response = await this.request(url, {
            method: 'PATCH',
            headers: this.getHeaders(true),
            body: JSON.stringify(data)
        });

        return this.handleResponse(response);
    }

    // Delete family member
    async deleteFamilyMember(id) {
        const url = `${this.baseURL}/predictions/family-history/${id}/`;
        console.log('📤 Deleting family member:', id);

        const response = await this.request(url, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
    }

    // Bulk delete family members
    async bulkDeleteFamilyMembers(ids) {
        const url = `${this.baseURL}/predictions/family-history/bulk-delete/`;
        console.log('📤 Bulk deleting family members:', ids);

        const response = await this.request(url, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ ids })
        });

        return this.handleResponse(response);
    }

    // Get genetic risk profile
    async getGeneticRiskProfile() {
        const url = `${this.baseURL}/predictions/family-history/genetic-risk/`;
        console.log('📤 Fetching genetic risk profile from:', url);

        const response = await this.request(url, {
            headers: this.getHeaders(true)
        });

        return this.handleResponse(response);
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

// Create the ApiService instance
const apiService = new ApiService();

// ========== CREATE WRAPPER API OBJECT ==========
// Create a new object that will be our API
const api = {};

// First, copy all methods from ApiService.prototype to ensure we get all methods
const proto = Object.getPrototypeOf(apiService);
Object.getOwnPropertyNames(proto).forEach(prop => {
    if (prop !== 'constructor' && typeof apiService[prop] === 'function') {
        // Bind each method to apiService
        api[prop] = apiService[prop].bind(apiService);
    }
});

// Then copy any instance-specific properties (like baseURL, sessionId, etc.)
Object.getOwnPropertyNames(apiService).forEach(prop => {
    // Skip if it's already defined (prefer prototype methods)
    if (!api[prop] && prop !== 'constructor') {
        if (typeof apiService[prop] === 'function') {
            api[prop] = apiService[prop].bind(apiService);
        } else {
            api[prop] = apiService[prop];
        }
    }
});

// ========== AXIOS-LIKE METHODS ==========

// GET method
api.get = async (url, config = {}) => {
    try {
        console.log(`📤 GET request to: ${url}`, config);

        // Handle AI chat history
        if (url.includes('/ai/chat/history/')) {
            const data = await api.getChatHistory();
            return { data, status: 200 };
        }

        // Handle predictions analytics
        else if (url.includes('/predictions/analytics/forecast/')) {
            const data = await api.getAnalyticsSummary();
            return {
                data: data?.forecast ? { forecast: data.forecast, confidence: data.confidence } : null,
                status: 200,
                statusText: 'OK'
            };
        }
        else if (url.includes('/predictions/analytics/peer-comparison/')) {
            const data = await api.getAnalyticsSummary();
            return { data, status: 200, statusText: 'OK' };
        }
        else if (url.includes('/predictions/analytics/correlation/')) {
            const data = await api.getAnalyticsSummary();
            return { data, status: 200, statusText: 'OK' };
        }
        else if (url.includes('/predictions/analytics/')) {
            const data = await api.getAnalyticsSummary();
            return { data, status: 200, statusText: 'OK' };
        }
        else if (url.includes('/resources/health-tips/')) {
            const data = await api.getPublicTips();
            return { data: { tips: data?.tips || data || [] }, status: 200 };
        }
        else if (url.includes('/resources/articles/')) {
            const data = { articles: [] };
            return { data, status: 200 };
        }
        else if (url.includes('/resources/challenges/') && !url.includes('/my_challenges/')) {
            const data = await api.getChallenges();
            return { data, status: 200 };
        }
        else if (url.includes('/resources/user/challenges/') || url.includes('/resources/challenges/my_challenges/')) {
            const data = await api.getMyChallenges();
            return { data, status: 200 };
        }
        else if (url.includes('/resources/search/')) {
            const data = {
                articles: [],
                tips: [],
                challenges: []
            };
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/export/')) {
            const blob = await api.exportData(config.params);
            return { data: blob, status: 200 };
        }
        else if (url.includes('/predictions/features/')) {
            const data = await api.getFeatureInfo();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/public/dashboard/')) {
            const data = await api.getPublicDashboard();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/health/profile/')) {
            const data = await api.getHealthProfile();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/health/history/')) {
            const data = await api.getHealthHistory();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/predictions/my_predictions/')) {
            const params = config.params || {};
            const data = await api.getMyPredictions(params);
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/predictions/trends/')) {
            const data = await api.getPredictionTrends();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/predictions/dashboard/')) {
            const data = await api.getDashboard();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/goals/')) {
            const data = await api.getGoals();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/medications/')) {
            const data = await api.getMedications();
            return { data, status: 200 };
        }
        else if (url.includes('/predictions/symptoms/')) {
            if (url.includes('/trends/')) {
                const data = await api.getSymptomTrends();
                return { data, status: 200 };
            }
            const data = await api.getSymptoms();
            return { data, status: 200 };
        }
        // ===== FAMILY HISTORY GET HANDLERS =====
        else if (url.includes('/predictions/family-history/')) {
            if (url.includes('/genetic-risk/')) {
                const data = await api.getGeneticRiskProfile();
                return { data, status: 200 };
            }
            
            // Handle single member
            const memberMatch = url.match(/\/predictions\/family-history\/(\d+)\//);
            if (memberMatch && !url.includes('/bulk-delete/')) {
                const id = memberMatch[1];
                const data = await api.getFamilyMember(id);
                return { data, status: 200 };
            }
            
            // Handle list
            const data = await api.getFamilyHistory();
            return { data, status: 200 };
        }

        // Handle dynamic routes
        const articleMatch = url.match(/\/resources\/articles\/(\d+)\//);
        if (articleMatch) {
            const id = articleMatch[1];
            const data = { id, title: 'Article', content: 'Content' };
            return { data, status: 200 };
        }

        const challengeMatch = url.match(/\/resources\/challenges\/(\d+)\//);
        if (challengeMatch && !url.includes('/join/') && !url.includes('/leave/')) {
            const id = challengeMatch[1];
            const data = { id, title: 'Challenge', description: 'Description' };
            return { data, status: 200 };
        }

        const predictionMatch = url.match(/\/predictions\/predictions\/(\d+)\//);
        if (predictionMatch && !url.includes('/explain/') && !url.includes('/feedback/')) {
            const id = predictionMatch[1];
            const data = await api.getPrediction(id);
            return { data, status: 200 };
        }

        const explainMatch = url.match(/\/predictions\/predictions\/(\d+)\/explain\//);
        if (explainMatch) {
            const id = explainMatch[1];
            const data = await api.getPredictionExplanation(id);
            return { data, status: 200 };
        }

        console.warn(`No handler for GET: ${url}`);
        return { data: null, status: 404, statusText: 'Not Found' };

    } catch (error) {
        console.error(`❌ GET request failed for ${url}:`, error);
        throw error;
    }
};

// POST method
api.post = async (url, data, config = {}) => {
    try {
        console.log(`📤 POST request to: ${url}`, { data, config });

        // Handle AI chat
        if (url.includes('/ai/chat/')) {
            const result = await api.sendChatMessage(data.message);
            return { data: result, status: 200 };
        }

        // Handle AI meal plan
        if (url.includes('/ai/meal-plan/')) {
            const result = await api.generateMealPlan(data.preferences);
            return { data: result, status: 200 };
        }

        // Handle AI symptom analysis
        if (url.includes('/ai/analyze-symptoms/')) {
            const result = await api.analyzeSymptoms(data.symptoms, data.duration);
            return { data: result, status: 200 };
        }

        // Handle join challenge
        const joinMatch = url.match(/\/resources\/challenges\/(\d+)\/join\//);
        if (joinMatch) {
            const challengeId = joinMatch[1];
            const result = await api.joinChallenge(challengeId);
            return { data: result, status: 200 };
        }

        const leaveMatch = url.match(/\/resources\/challenges\/(\d+)\/leave\//);
        if (leaveMatch) {
            const challengeId = leaveMatch[1];
            const result = await api.leaveChallenge(challengeId);
            return { data: result, status: 200 };
        }

        if (url.includes('/predictions/public/predict/')) {
            const result = await api.publicPredict(data);
            return { data: result, status: 200 };
        }

        if (url.includes('/predictions/predictions/simulate/')) {
            const result = await api.runSimulation(data);
            return { data: result, status: 200 };
        }

        const feedbackMatch = url.match(/\/predictions\/predictions\/(\d+)\/feedback\//);
        if (feedbackMatch) {
            const id = feedbackMatch[1];
            const result = await api.submitPredictionFeedback(id, data);
            return { data: result, status: 200 };
        }

        if (url.includes('/predictions/health/metrics/')) {
            const result = await api.updateHealthMetrics(data);
            return { data: result, status: 200 };
        }

        if (url.includes('/predictions/goals/')) {
            const result = await api.createGoal(data);
            return { data: result, status: 201 };
        }

        const goalProgressMatch = url.match(/\/predictions\/goals\/(\d+)\/update_progress\//);
        if (goalProgressMatch) {
            const id = goalProgressMatch[1];
            const result = await api.updateGoalProgress(id, data.value);
            return { data: result, status: 200 };
        }

        if (url.includes('/predictions/medications/')) {
            const result = await api.createMedication(data);
            return { data: result, status: 201 };
        }

        const doseMatch = url.match(/\/predictions\/medications\/(\d+)\/take_dose\//);
        if (doseMatch) {
            const id = doseMatch[1];
            const result = await api.takeDose(id);
            return { data: result, status: 200 };
        }

        if (url.includes('/predictions/symptoms/')) {
            const result = await api.logSymptom(data);
            return { data: result, status: 201 };
        }

        if (url.includes('/auth/login/')) {
            const result = await api.login(data);
            return { data: result, status: 200 };
        }

        if (url.includes('/auth/register/')) {
            const result = await api.register(data);
            return { data: result, status: 201 };
        }

        if (url.includes('/auth/logout/')) {
            const refreshToken = data?.refresh;
            const result = await api.logout(refreshToken);
            return { data: result, status: 200 };
        }

        if (url.includes('/auth/token/refresh/')) {
            const result = await api.refreshToken(data.refresh);
            return { data: result, status: 200 };
        }

        if (url.includes('/auth/password-reset/')) {
            if (url.includes('/confirm/')) {
                const result = await api.resetPassword(data.token, data.password);
                return { data: result, status: 200 };
            }
            const result = await api.forgotPassword(data.email);
            return { data: result, status: 200 };
        }

        if (url.includes('/auth/change-password/')) {
            const result = await api.changePassword(data);
            return { data: result, status: 200 };
        }

        // ===== FAMILY HISTORY POST HANDLERS =====
        else if (url.includes('/predictions/family-history/')) {
            if (url.includes('/bulk-delete/')) {
                const result = await api.bulkDeleteFamilyMembers(data.ids);
                return { data: result, status: 200 };
            }
            
            const result = await api.createFamilyMember(data);
            return { data: result, status: 201 };
        }

        console.warn(`No handler for POST: ${url}`);
        return { data: null, status: 404, statusText: 'Not Found' };

    } catch (error) {
        console.error(`❌ POST request failed for ${url}:`, error);
        throw error;
    }
};

// PATCH method
api.patch = async (url, data, config = {}) => {
    try {
        console.log(`📤 PATCH request to: ${url}`, { data, config });

        // Handle update health profile
        if (url.includes('/predictions/health/profile/')) {
            const result = await api.updateHealthProfile(data);
            return { data: result, status: 200 };
        }

        // Handle update medication
        const medicationMatch = url.match(/\/predictions\/medications\/(\d+)\//);
        if (medicationMatch) {
            const id = medicationMatch[1];
            const result = await api.updateMedication(id, data);
            return { data: result, status: 200 };
        }

        // Handle update symptom
        const symptomMatch = url.match(/\/predictions\/symptoms\/(\d+)\//);
        if (symptomMatch) {
            const id = symptomMatch[1];
            const result = await api.updateSymptom(id, data);
            return { data: result, status: 200 };
        }

        // ===== FAMILY HISTORY PATCH HANDLERS =====
        else if (url.includes('/predictions/family-history/')) {
            const memberMatch = url.match(/\/predictions\/family-history\/(\d+)\//);
            if (memberMatch) {
                const id = memberMatch[1];
                const result = await api.updateFamilyMember(id, data);
                return { data: result, status: 200 };
            }
        }

        console.warn(`No handler for PATCH: ${url}`);
        return { data: null, status: 404 };

    } catch (error) {
        console.error(`❌ PATCH request failed for ${url}:`, error);
        throw error;
    }
};

// PUT method
api.put = async (url, data, config = {}) => {
    console.log(`📤 PUT request to: ${url}`, { data, config });
    return { data: null, status: 404 };
};

// DELETE method
api.delete = async (url, config = {}) => {
    try {
        console.log(`📤 DELETE request to: ${url}`, config);

        // Handle delete prediction
        const predictionMatch = url.match(/\/predictions\/predictions\/(\d+)\//);
        if (predictionMatch) {
            const id = predictionMatch[1];
            const result = await api.deletePrediction(id);
            return { data: result, status: 204 };
        }

        // Handle delete goal
        const goalMatch = url.match(/\/predictions\/goals\/(\d+)\//);
        if (goalMatch) {
            const id = goalMatch[1];
            const result = await api.deleteGoal(id);
            return { data: result, status: 204 };
        }

        // Handle delete medication
        const medicationMatch = url.match(/\/predictions\/medications\/(\d+)\//);
        if (medicationMatch) {
            const id = medicationMatch[1];
            const result = await api.deleteMedication(id);
            return { data: result, status: 204 };
        }

        // Handle delete symptom
        const symptomMatch = url.match(/\/predictions\/symptoms\/(\d+)\//);
        if (symptomMatch) {
            const id = symptomMatch[1];
            const result = await api.deleteSymptom(id);
            return { data: result, status: 204 };
        }

        // ===== FAMILY HISTORY DELETE HANDLERS =====
        else if (url.includes('/predictions/family-history/')) {
            const memberMatch = url.match(/\/predictions\/family-history\/(\d+)\//);
            if (memberMatch) {
                const id = memberMatch[1];
                const result = await api.deleteFamilyMember(id);
                return { data: result, status: 204 };
            }
        }

        console.warn(`No handler for DELETE: ${url}`);
        return { data: null, status: 404 };

    } catch (error) {
        console.error(`❌ DELETE request failed for ${url}:`, error);
        throw error;
    }
};

// Add utility methods
api.create = (config) => {
    console.log('Creating axios-like instance with config:', config);
    return api;
};

api.defaults = {
    baseURL: api.baseURL,
    headers: {}
};

api.interceptors = {
    request: {
        use: (onFulfilled, onRejected) => {
            console.log('Request interceptor registered');
            return 0;
        }
    },
    response: {
        use: (onFulfilled, onRejected) => {
            console.log('Response interceptor registered');
            return 0;
        }
    }
};

// Add helper methods for common patterns
api.request = async (config) => {
    const { method, url, data, params } = config;

    switch (method?.toLowerCase()) {
        case 'get':
            return api.get(url, { params });
        case 'post':
            return api.post(url, data);
        case 'put':
            return api.put(url, data);
        case 'patch':
            return api.patch(url, data);
        case 'delete':
            return api.delete(url);
        default:
            throw new Error(`Unsupported method: ${method}`);
    }
};

api.all = (promises) => Promise.all(promises);
api.spread = (callback) => (arr) => callback.apply(null, arr);

// Export the enhanced api as default
export default api;