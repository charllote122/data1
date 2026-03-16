// src/context/ResourcesContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import resourcesService from '../services/resources';
import toast from 'react-hot-toast';

const ResourcesContext = createContext(null);

export const ResourcesProvider = ({ children }) => {
    const { user } = useAuth();
    const [articles, setArticles] = useState([]);
    const [tips, setTips] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rateLimited, setRateLimited] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [lastFetchTime, setLastFetchTime] = useState(0);

    // Use refs to track initialization and prevent duplicate fetches
    const isInitialized = useRef(false);
    const fetchInProgress = useRef(false);
    const mounted = useRef(true);

    // Load resources on mount and when user changes
    useEffect(() => {
        mounted.current = true;

        // Only load if not initialized or user changed
        if (!isInitialized.current || user) {
            loadResources();
            isInitialized.current = true;
        }

        return () => {
            mounted.current = false;
        };
    }, [user]); // Only re-run when user changes

    // Cooldown timer for rate limiting
    useEffect(() => {
        let timer;
        if (rateLimited && cooldownSeconds > 0) {
            timer = setInterval(() => {
                setCooldownSeconds(prev => {
                    if (prev <= 1) {
                        setRateLimited(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [rateLimited, cooldownSeconds]);

    // Check cache status periodically
    useEffect(() => {
        const checkCache = () => {
            const status = resourcesService.getCacheStatus();
            console.log('📊 Resources cache status:', status);
        };

        // Check every 30 seconds in development only
        if (process.env.NODE_ENV === 'development') {
            const interval = setInterval(checkCache, 30000);
            return () => clearInterval(interval);
        }
    }, []);

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds} seconds`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes < 60) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    const handleRateLimit = (error) => {
        if (error?.status === 429) {
            setRateLimited(true);

            // Extract wait time from error message
            let waitTime = 300; // Default 5 minutes
            if (error.detail) {
                const match = error.detail.match(/available in (\d+) seconds/);
                if (match && match[1]) {
                    waitTime = parseInt(match[1]);
                }
            } else if (error.message) {
                const match = error.message.match(/available in (\d+) seconds/);
                if (match && match[1]) {
                    waitTime = parseInt(match[1]);
                }
            }

            // Cap wait time at 1 hour to be user-friendly
            waitTime = Math.min(waitTime, 3600);
            setCooldownSeconds(waitTime);

            // Only show toast if not already showing
            toast.error(
                <div>
                    <p className="font-semibold">Rate limit reached</p>
                    <p className="text-sm">Please wait {formatTime(waitTime)}</p>
                </div>,
                {
                    duration: 5000,
                    id: 'rate-limit-toast',
                    icon: '⏳'
                }
            );

            return true;
        }
        return false;
    };

    const loadResources = useCallback(async (forceRefresh = false) => {
        // Prevent multiple simultaneous fetches
        if (fetchInProgress.current) {
            console.log('⏳ Fetch already in progress, skipping...');
            return;
        }

        // Don't fetch if rate limited
        if (rateLimited) {
            console.log(`⏰ Rate limited, waiting ${cooldownSeconds}s`);
            return;
        }

        fetchInProgress.current = true;
        setLoading(true);
        setError(null);

        try {
            console.log('📚 Loading resources...', forceRefresh ? '(force refresh)' : '');

            // Load public tips (no auth needed) - with caching
            const tipsPromise = resourcesService.getHealthTips(forceRefresh)
                .catch(err => {
                    handleRateLimit(err);
                    // Try to get cached data on error
                    const cached = resourcesService.cache.tips?.data;
                    if (cached) {
                        console.log('📦 Using cached tips due to error');
                        return cached;
                    }
                    return [];
                });

            // Load challenges (might need auth) - only if user is logged in
            let challengesPromise = Promise.resolve([]);
            if (user) {
                challengesPromise = resourcesService.getChallenges(forceRefresh)
                    .catch(err => {
                        handleRateLimit(err);
                        const cached = resourcesService.cache.challenges?.data;
                        if (cached) {
                            console.log('📦 Using cached challenges due to error');
                            return cached;
                        }
                        return [];
                    });
            }

            // Load articles (if available)
            const articlesPromise = resourcesService.getArticles?.(forceRefresh)
                .catch(err => {
                    handleRateLimit(err);
                    const cached = resourcesService.cache.articles?.data;
                    if (cached) {
                        console.log('📦 Using cached articles due to error');
                        return cached;
                    }
                    return [];
                }) || Promise.resolve([]);

            // Wait for all promises to settle (don't fail if one fails)
            const results = await Promise.allSettled([
                tipsPromise,
                challengesPromise,
                articlesPromise
            ]);

            // Only update state if component is still mounted
            if (mounted.current) {
                // Handle tips
                if (results[0].status === 'fulfilled') {
                    setTips(results[0].value || []);
                } else {
                    console.warn('Tips fetch failed:', results[0].reason);
                }

                // Handle challenges
                if (results[1].status === 'fulfilled') {
                    setChallenges(results[1].value || []);
                } else {
                    console.warn('Challenges fetch failed:', results[1].reason);
                }

                // Handle articles
                if (results[2].status === 'fulfilled') {
                    setArticles(results[2].value || []);
                } else {
                    console.warn('Articles fetch failed:', results[2].reason);
                }

                setLastFetchTime(Date.now());
            }

        } catch (error) {
            console.error('Failed to load resources:', error);
            if (mounted.current) {
                handleRateLimit(error);
                setError(error.message || 'Failed to load resources');
            }
        } finally {
            if (mounted.current) {
                setLoading(false);
            }
            fetchInProgress.current = false;
        }
    }, [user, rateLimited, cooldownSeconds]);

    const refreshResources = useCallback(() => {
        if (rateLimited) {
            const timeLeft = formatTime(cooldownSeconds);
            toast.error(`Please wait ${timeLeft} before refreshing.`, {
                duration: 3000,
                id: 'refresh-blocked'
            });
            return;
        }

        // Clear cache and reload
        resourcesService.clearCache();
        loadResources(true);

        toast.success('Refreshing resources...', {
            duration: 2000,
            id: 'refreshing'
        });
    }, [rateLimited, cooldownSeconds, loadResources]);

    const joinChallenge = async (id) => {
        if (!user) {
            toast.error('Please log in to join challenges', {
                id: 'join-error'
            });
            return { success: false, error: 'Authentication required' };
        }

        // Optimistic update
        const challengeIndex = challenges.findIndex(c => c.id === id);
        const originalChallenge = challengeIndex >= 0 ? { ...challenges[challengeIndex] } : null;

        if (challengeIndex >= 0) {
            const updatedChallenges = [...challenges];
            updatedChallenges[challengeIndex] = {
                ...updatedChallenges[challengeIndex],
                joined: true,
                participants_count: (updatedChallenges[challengeIndex].participants_count || 0) + 1
            };
            setChallenges(updatedChallenges);
        }

        try {
            const result = await resourcesService.joinChallenge(id);

            // Refresh to get latest data
            await loadResources(true);

            toast.success('🎉 Successfully joined challenge!', {
                id: 'join-success'
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Failed to join challenge:', error);

            // Revert optimistic update
            if (originalChallenge && challengeIndex >= 0) {
                const revertedChallenges = [...challenges];
                revertedChallenges[challengeIndex] = originalChallenge;
                setChallenges(revertedChallenges);
            }

            if (error.status === 429) {
                handleRateLimit(error);
            } else {
                toast.error(error.message || 'Failed to join challenge', {
                    id: 'join-error'
                });
            }

            return { success: false, error: error.message };
        }
    };

    const leaveChallenge = async (id) => {
        if (!user) {
            toast.error('Please log in to leave challenges', {
                id: 'leave-error'
            });
            return { success: false, error: 'Authentication required' };
        }

        // Optimistic update
        const challengeIndex = challenges.findIndex(c => c.id === id);
        const originalChallenge = challengeIndex >= 0 ? { ...challenges[challengeIndex] } : null;

        if (challengeIndex >= 0) {
            const updatedChallenges = [...challenges];
            updatedChallenges[challengeIndex] = {
                ...updatedChallenges[challengeIndex],
                joined: false,
                participants_count: Math.max(0, (updatedChallenges[challengeIndex].participants_count || 1) - 1)
            };
            setChallenges(updatedChallenges);
        }

        try {
            const result = await resourcesService.leaveChallenge(id);

            // Refresh to get latest data
            await loadResources(true);

            toast.success('Left challenge', {
                id: 'leave-success'
            });

            return { success: true, data: result };
        } catch (error) {
            console.error('Failed to leave challenge:', error);

            // Revert optimistic update
            if (originalChallenge && challengeIndex >= 0) {
                const revertedChallenges = [...challenges];
                revertedChallenges[challengeIndex] = originalChallenge;
                setChallenges(revertedChallenges);
            }

            toast.error(error.message || 'Failed to leave challenge', {
                id: 'leave-error'
            });

            return { success: false, error: error.message };
        }
    };

    const getTipById = (id) => {
        return tips.find(tip => tip.id === id);
    };

    const getArticleById = (id) => {
        return articles.find(article => article.id === id);
    };

    const getChallengeById = (id) => {
        return challenges.find(challenge => challenge.id === id);
    };

    const value = {
        // Data
        articles,
        tips,
        challenges,

        // State
        loading,
        error,
        rateLimited,
        cooldownSeconds,
        lastFetchTime,

        // Methods
        refresh: refreshResources,
        joinChallenge,
        leaveChallenge,
        getTipById,
        getArticleById,
        getChallengeById,

        // Utility
        hasError: !!error,
        isStale: lastFetchTime ? (Date.now() - lastFetchTime) > 300000 : false, // 5 minutes
        hasChallenges: challenges.length > 0,
        hasTips: tips.length > 0,
        hasArticles: articles.length > 0,

        // Counts
        tipsCount: tips.length,
        challengesCount: challenges.length,
        articlesCount: articles.length
    };

    return (
        <ResourcesContext.Provider value={value}>
            {children}
        </ResourcesContext.Provider>
    );
};

export const useResources = () => {
    const context = useContext(ResourcesContext);
    if (!context) {
        throw new Error('useResources must be used within a ResourcesProvider');
    }
    return context;
};

export default ResourcesProvider;