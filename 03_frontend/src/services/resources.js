// src/services/resources.js
import api from './api';

class ResourcesService {
    constructor() {
        this.cache = {
            tips: { data: null, timestamp: null, promise: null },
            challenges: { data: null, timestamp: null, promise: null },
            articles: { data: null, timestamp: null, promise: null }
        };
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (increased significantly)
        this.pendingRequests = new Map();
        this.rateLimitUntil = null; // Track when rate limit expires

        // Permanent fallback data (never changes)
        this.fallbackData = {
            tips: [
                {
                    id: 'fallback-tip-1',
                    title: 'Stay Hydrated',
                    content: 'Drink at least 8 glasses of water daily to help maintain normal blood sugar levels and support overall health.',
                    category: 'wellness',
                    icon: 'HeartIcon',
                    color: 'blue'
                },
                {
                    id: 'fallback-tip-2',
                    title: 'Regular Exercise',
                    content: 'Aim for 30 minutes of moderate activity daily to improve insulin sensitivity and maintain healthy weight.',
                    category: 'fitness',
                    icon: 'BeakerIcon',
                    color: 'green'
                },
                {
                    id: 'fallback-tip-3',
                    title: 'Balanced Diet',
                    content: 'Include fiber-rich foods like vegetables, legumes, and whole grains to help stabilize blood sugar.',
                    category: 'nutrition',
                    icon: 'AcademicCapIcon',
                    color: 'purple'
                },
                {
                    id: 'fallback-tip-4',
                    title: 'Monitor Blood Sugar',
                    content: 'Regular monitoring helps you understand how food, activity, and stress affect your levels.',
                    category: 'diabetes',
                    icon: 'DocumentTextIcon',
                    color: 'orange'
                },
                {
                    id: 'fallback-tip-5',
                    title: 'Get Enough Sleep',
                    content: 'Poor sleep can affect blood sugar levels and insulin sensitivity. Aim for 7-9 hours per night.',
                    category: 'wellness',
                    icon: 'ClockIcon',
                    color: 'indigo'
                },
                {
                    id: 'fallback-tip-6',
                    title: 'Stress Management',
                    content: 'Chronic stress can raise blood sugar. Try meditation, deep breathing, or yoga to manage stress.',
                    category: 'mental-health',
                    icon: 'SparklesIcon',
                    color: 'pink'
                },
                {
                    id: 'fallback-tip-7',
                    title: 'Healthy Snacking',
                    content: 'Choose snacks with protein and fiber to keep blood sugar stable between meals.',
                    category: 'nutrition',
                    icon: 'HeartIcon',
                    color: 'green'
                },
                {
                    id: 'fallback-tip-8',
                    title: 'Know Your Numbers',
                    content: 'Track your blood pressure, cholesterol, and A1C levels regularly.',
                    category: 'diabetes',
                    icon: 'BeakerIcon',
                    color: 'orange'
                },
                {
                    id: 'fallback-tip-9',
                    title: 'Take Medications on Time',
                    content: 'Set reminders to take medications as prescribed by your doctor.',
                    category: 'medications',
                    icon: 'ClockIcon',
                    color: 'purple'
                }
            ],
            challenges: [
                {
                    id: 'fallback-challenge-1',
                    title: '10,000 Steps Daily',
                    description: 'Walk 10,000 steps every day for a month to improve cardiovascular health.',
                    duration_days: 30,
                    participants_count: 1245,
                    joined: false,
                    category: 'fitness'
                },
                {
                    id: 'fallback-challenge-2',
                    title: 'Sugar-Free Week',
                    description: 'Go without added sugar for 7 days and see how you feel.',
                    duration_days: 7,
                    participants_count: 892,
                    joined: false,
                    category: 'nutrition'
                },
                {
                    id: 'fallback-challenge-3',
                    title: 'Meditation Month',
                    description: 'Meditate for 10 minutes daily to reduce stress and improve mental health.',
                    duration_days: 30,
                    participants_count: 567,
                    joined: false,
                    category: 'mental-health'
                },
                {
                    id: 'fallback-challenge-4',
                    title: 'Hydration Challenge',
                    description: 'Drink 8 glasses of water every day for two weeks.',
                    duration_days: 14,
                    participants_count: 2103,
                    joined: false,
                    category: 'wellness'
                },
                {
                    id: 'fallback-challenge-5',
                    title: 'Sleep Improvement',
                    description: 'Get 7-8 hours of sleep each night for 21 days.',
                    duration_days: 21,
                    participants_count: 756,
                    joined: false,
                    category: 'wellness'
                }
            ],
            articles: [
                {
                    id: 'fallback-article-1',
                    title: 'Understanding Type 2 Diabetes',
                    summary: 'Learn about the causes, risk factors, and early warning signs of type 2 diabetes.',
                    category: 'education',
                    read_time: 5,
                    author: 'Dr. Sarah Johnson',
                    content: 'Full article content would go here...'
                },
                {
                    id: 'fallback-article-2',
                    title: 'Healthy Eating for Blood Sugar Control',
                    summary: 'Discover which foods help stabilize blood sugar and which ones to avoid.',
                    category: 'nutrition',
                    read_time: 7,
                    author: 'Nutritionist Maria Garcia',
                    content: 'Full article content would go here...'
                },
                {
                    id: 'fallback-article-3',
                    title: 'Exercise Guide for Beginners',
                    summary: 'Safe and effective exercise strategies for people at risk of diabetes.',
                    category: 'fitness',
                    read_time: 6,
                    author: 'Fitness Coach Mike Thompson',
                    content: 'Full article content would go here...'
                },
                {
                    id: 'fallback-article-4',
                    title: 'Stress and Blood Sugar',
                    summary: 'How stress affects your blood sugar and techniques to manage it.',
                    category: 'mental-health',
                    read_time: 4,
                    author: 'Dr. Emily Chen',
                    content: 'Full article content would go here...'
                }
            ]
        };
    }

    // Check if we're currently rate limited
    isRateLimited() {
        if (this.rateLimitUntil && Date.now() < this.rateLimitUntil) {
            const remainingSeconds = Math.round((this.rateLimitUntil - Date.now()) / 1000);
            console.log(`⏰ Rate limited for ${remainingSeconds} more seconds`);
            return true;
        }
        return false;
    }

    // Get fallback data with user-specific customization
    getFallbackData(type, user = null) {
        const data = this.fallbackData[type];

        // If user is logged in, we could personalize the fallback data
        if (user) {
            // For example, randomly mark some challenges as joined based on user ID
            if (type === 'challenges') {
                const userId = user.id || 'anonymous';
                const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

                return data.map((item, index) => ({
                    ...item,
                    // Deterministically set some challenges as "joined" based on user ID
                    joined: (hash + index) % 3 === 0 // 1/3 of challenges appear joined
                }));
            }
        }

        return data;
    }

    // Check if cache is valid
    isCacheValid(cacheKey) {
        const cache = this.cache[cacheKey];
        if (!cache || !cache.timestamp) return false;
        return Date.now() - cache.timestamp < this.CACHE_DURATION;
    }

    // Get from cache or fetch with deduplication
    async getCachedOrFetch(cacheKey, fetchFn, forceRefresh = false, user = null) {
        // If rate limited, immediately return fallback data
        if (this.isRateLimited()) {
            console.log(`📋 Using fallback ${cacheKey} (rate limited)`);
            return this.getFallbackData(cacheKey, user);
        }

        const cache = this.cache[cacheKey];

        // Return cached data if valid and not forcing refresh
        if (!forceRefresh && this.isCacheValid(cacheKey) && cache.data) {
            console.log(`📦 Using cached ${cacheKey} (age: ${Math.round((Date.now() - cache.timestamp) / 1000)}s)`);
            return cache.data;
        }

        // Check if there's already a pending request for this key
        if (this.pendingRequests.has(cacheKey)) {
            console.log(`⏳ Waiting for existing ${cacheKey} request...`);
            try {
                return await this.pendingRequests.get(cacheKey);
            } catch (error) {
                // If pending request fails, return fallback
                console.log(`⚠️ Pending request failed, using fallback ${cacheKey}`);
                return this.getFallbackData(cacheKey, user);
            }
        }

        // Create new request
        console.log(`🌐 Fetching fresh ${cacheKey}`);
        const promise = fetchFn().then(data => {
            // Store in cache
            this.cache[cacheKey] = {
                data,
                timestamp: Date.now(),
                promise: null
            };
            // Remove from pending
            this.pendingRequests.delete(cacheKey);
            return data;
        }).catch(error => {
            // Remove from pending on error
            this.pendingRequests.delete(cacheKey);

            // Handle rate limiting
            if (error.status === 429) {
                // Set rate limit for 1 hour
                this.rateLimitUntil = Date.now() + (60 * 60 * 1000); // 1 hour

                // Extract wait time from error for more accuracy
                if (error.detail) {
                    const match = error.detail.match(/available in (\d+) seconds/);
                    if (match && match[1]) {
                        const waitSeconds = parseInt(match[1]);
                        this.rateLimitUntil = Date.now() + (waitSeconds * 1000);
                    }
                }

                console.log(`🚫 Rate limited until ${new Date(this.rateLimitUntil).toLocaleTimeString()}`);
            }

            // If we have stale cache, return it on error
            if (cache.data) {
                console.log(`⚠️ Using stale ${cacheKey} due to error`);
                return cache.data;
            }

            // Otherwise return fallback data
            console.log(`📋 Using fallback ${cacheKey} due to error`);
            return this.getFallbackData(cacheKey, user);
        });

        // Store promise
        this.pendingRequests.set(cacheKey, promise);

        // Also store in cache promise for reference
        this.cache[cacheKey].promise = promise;

        return promise;
    }

    // Get health tips
    async getHealthTips(forceRefresh = false, user = null) {
        return this.getCachedOrFetch('tips', async () => {
            try {
                const response = await api.get('/resources/health-tips/');
                console.log('✅ Tips fetched successfully');

                // Handle different response formats
                if (response?.data?.tips) {
                    return response.data.tips;
                } else if (Array.isArray(response?.data)) {
                    return response.data;
                } else if (response?.data?.results) {
                    return response.data.results;
                }

                // If API returns empty but no error, still return fallback
                console.log('⚠️ API returned empty tips, using fallback');
                return this.getFallbackData('tips', user);

            } catch (error) {
                console.error('Error fetching health tips:', error);
                throw error; // Let getCachedOrFetch handle the error
            }
        }, forceRefresh, user);
    }

    // Get challenges
    async getChallenges(forceRefresh = false, user = null) {
        return this.getCachedOrFetch('challenges', async () => {
            try {
                const response = await api.get('/resources/challenges/');
                console.log('✅ Challenges fetched successfully');

                if (response?.data?.challenges) {
                    return response.data.challenges;
                } else if (Array.isArray(response?.data)) {
                    return response.data;
                } else if (response?.data?.results) {
                    return response.data.results;
                }

                return this.getFallbackData('challenges', user);

            } catch (error) {
                console.error('Error fetching challenges:', error);
                throw error;
            }
        }, forceRefresh, user);
    }

    // Get articles
    async getArticles(forceRefresh = false, user = null) {
        return this.getCachedOrFetch('articles', async () => {
            try {
                const response = await api.get('/resources/articles/');
                console.log('✅ Articles fetched successfully');

                if (response?.data?.articles) {
                    return response.data.articles;
                } else if (Array.isArray(response?.data)) {
                    return response.data;
                } else if (response?.data?.results) {
                    return response.data.results;
                }

                // Return empty array if endpoint doesn't exist, but use fallback if available
                if (error?.status === 404) {
                    return this.getFallbackData('articles', user);
                }

                return this.getFallbackData('articles', user);

            } catch (error) {
                console.error('Error fetching articles:', error);
                throw error;
            }
        }, forceRefresh, user);
    }

    // Join a challenge
    async joinChallenge(id, user = null) {
        // If rate limited, simulate success with optimistic update
        if (this.isRateLimited()) {
            console.log('📋 Simulating join challenge (rate limited)');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            return { success: true, simulated: true };
        }

        try {
            const response = await api.post(`/resources/challenges/${id}/join/`, {});

            // Invalidate challenges cache after joining
            this.cache.challenges.timestamp = null;
            this.cache.challenges.promise = null;

            return response.data;
        } catch (error) {
            console.error('Error joining challenge:', error);

            // If rate limited during join, set rate limit flag
            if (error.status === 429) {
                this.rateLimitUntil = Date.now() + (60 * 60 * 1000);
            }

            throw error;
        }
    }

    // Leave a challenge
    async leaveChallenge(id, user = null) {
        // If rate limited, simulate success with optimistic update
        if (this.isRateLimited()) {
            console.log('📋 Simulating leave challenge (rate limited)');
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            return { success: true, simulated: true };
        }

        try {
            const response = await api.post(`/resources/challenges/${id}/leave/`, {});

            // Invalidate challenges cache after leaving
            this.cache.challenges.timestamp = null;
            this.cache.challenges.promise = null;

            return response.data;
        } catch (error) {
            console.error('Error leaving challenge:', error);

            if (error.status === 429) {
                this.rateLimitUntil = Date.now() + (60 * 60 * 1000);
            }

            throw error;
        }
    }

    // Get single challenge by ID
    async getChallenge(id, user = null) {
        if (this.isRateLimited()) {
            const fallbackChallenges = this.getFallbackData('challenges', user);
            return fallbackChallenges.find(c => c.id === id) || null;
        }

        try {
            const response = await api.get(`/resources/challenges/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching challenge:', error);

            if (error.status === 429) {
                this.rateLimitUntil = Date.now() + (60 * 60 * 1000);
                const fallbackChallenges = this.getFallbackData('challenges', user);
                return fallbackChallenges.find(c => c.id === id) || null;
            }

            throw error;
        }
    }

    // Get user's joined challenges
    async getMyChallenges(user = null) {
        if (this.isRateLimited()) {
            const fallbackChallenges = this.getFallbackData('challenges', user);
            return fallbackChallenges.filter(c => c.joined);
        }

        try {
            const response = await api.get('/resources/challenges/my_challenges/');
            return response.data?.challenges || response.data || [];
        } catch (error) {
            console.error('Error fetching my challenges:', error);

            if (error.status === 429) {
                this.rateLimitUntil = Date.now() + (60 * 60 * 1000);
                const fallbackChallenges = this.getFallbackData('challenges', user);
                return fallbackChallenges.filter(c => c.joined);
            }

            throw error;
        }
    }

    // Clear all caches
    clearCache() {
        this.cache = {
            tips: { data: null, timestamp: null, promise: null },
            challenges: { data: null, timestamp: null, promise: null },
            articles: { data: null, timestamp: null, promise: null }
        };
        this.pendingRequests.clear();
        // Don't clear rateLimitUntil - that should persist
        console.log('🧹 Resources cache cleared');
    }

    // Reset rate limit (useful for testing)
    resetRateLimit() {
        this.rateLimitUntil = null;
        console.log('✅ Rate limit reset');
    }

    // Get cache status
    getCacheStatus() {
        return {
            tips: {
                hasData: !!this.cache.tips.data,
                age: this.cache.tips.timestamp ?
                    Math.round((Date.now() - this.cache.tips.timestamp) / 1000) + 's' : 'none',
                pending: this.pendingRequests.has('tips')
            },
            challenges: {
                hasData: !!this.cache.challenges.data,
                age: this.cache.challenges.timestamp ?
                    Math.round((Date.now() - this.cache.challenges.timestamp) / 1000) + 's' : 'none',
                pending: this.pendingRequests.has('challenges')
            },
            articles: {
                hasData: !!this.cache.articles.data,
                age: this.cache.articles.timestamp ?
                    Math.round((Date.now() - this.cache.articles.timestamp) / 1000) + 's' : 'none',
                pending: this.pendingRequests.has('articles')
            },
            rateLimited: this.isRateLimited(),
            rateLimitExpiry: this.rateLimitUntil ? new Date(this.rateLimitUntil).toLocaleString() : null
        };
    }
}

// Create and export a single instance
const resourcesService = new ResourcesService();
export default resourcesService;