// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import authService from '../../services/auth';
import { ROUTES } from '../../constants/routes';
import {
    EnvelopeIcon, LockClosedIcon,
    ArrowPathIcon, EyeIcon, EyeSlashIcon,
    ArrowLeftIcon, ShieldCheckIcon, CheckCircleIcon,
    ExclamationTriangleIcon, XCircleIcon, ArrowRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: authLogin } = useAuth();
    const { showNotification } = useNotification();

    // Get state from location
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
    const message = location.state?.message;
    const registeredEmail = location.state?.email;

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [formData, setFormData] = useState({
        username: registeredEmail || '',
        password: '',
        remember: false
    });

    // Check for message from navigation state
    useEffect(() => {
        if (message) {
            showNotification('success', message);
            // Clear the state to prevent showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [message, showNotification]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear field error when typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Clear general error when typing
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }));
        }
    };

    const handleBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username or email is required';
        } else if (formData.username.includes('@') && !/\S+@\S+\.\S+/.test(formData.username)) {
            newErrors.username = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showNotification('error', Object.values(newErrors)[0]);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const loginData = {
                username: formData.username.trim(),
                password: formData.password
            };

            console.log('📤 Attempting login with:', loginData);

            const response = await authService.login(loginData);

            console.log('✅ Login successful:', response);

            // Call auth login with tokens
            authLogin(
                response.user,
                response.access,
                response.refresh,
                formData.remember
            );

            // Show welcome message
            const userName = response.user.first_name || response.user.username;
            showNotification('success', `✨ Welcome back, ${userName}!`);

            // Navigate to dashboard
            navigate(from, { replace: true });

        } catch (error) {
            console.error('❌ Login error:', error);

            // Increment login attempts
            setLoginAttempts(prev => prev + 1);

            // Handle specific error cases
            if (error.status === 400) {
                if (error.errors?.non_field_errors) {
                    // This is the "invalid credentials" error from Django REST framework
                    const errorMsg = error.errors.non_field_errors[0];

                    if (errorMsg.includes('verify')) {
                        setErrors({ general: 'Please verify your email before logging in.' });
                        showNotification('warning', 'Please verify your email before logging in.');
                    } else {
                        setErrors({ general: 'Invalid username or password' });
                        showNotification('error', 'Invalid username or password');
                    }
                } else if (error.errors) {
                    // Handle field-specific errors
                    setErrors(error.errors);
                    const firstError = Object.values(error.errors)[0];
                    showNotification('error', Array.isArray(firstError) ? firstError[0] : firstError);
                } else {
                    setErrors({ general: 'Login failed. Please check your credentials.' });
                    showNotification('error', 'Invalid username or password');
                }
            } else if (error.status === 401) {
                setErrors({ general: 'Session expired. Please login again.' });
                showNotification('error', 'Session expired');
            } else if (error.status === 403) {
                setErrors({ general: 'Account locked. Too many failed attempts.' });
                showNotification('error', 'Account temporarily locked');
            } else if (error.status === 429) {
                setErrors({ general: 'Too many login attempts. Please try again later.' });
                showNotification('error', 'Rate limit exceeded');
            } else {
                const errorMsg = error.message || 'Login failed. Please try again.';
                setErrors({ general: errorMsg });
                showNotification('error', errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                                <p className="text-indigo-100 mt-2">Sign in to continue your health journey</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <SparklesIcon className="w-5 h-5 text-yellow-300" />
                                <span className="text-sm text-white">Secure Login</span>
                            </div>
                        </div>
                    </div>

                    {/* Success Message Banner */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
                        >
                            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700">{message}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Username/Email field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username or Email <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('username')}
                                    disabled={loading}
                                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                        ${touchedFields.username && errors.username
                                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                                            : 'border-gray-200 focus:border-indigo-500'
                                        }
                                        ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                                    `}
                                    placeholder="johndoe@example.com"
                                    autoComplete="username"
                                />
                            </div>
                            {touchedFields.username && errors.username && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                    {errors.username}
                                </motion.p>
                            )}
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('password')}
                                    disabled={loading}
                                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition
                                        ${touchedFields.password && errors.password
                                            ? 'border-red-300 bg-red-50 focus:border-red-500'
                                            : 'border-gray-200 focus:border-indigo-500'
                                        }
                                        ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}
                                    `}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            {touchedFields.password && errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-1 text-sm text-red-600 flex items-center gap-1"
                                >
                                    <XCircleIcon className="w-4 h-4" />
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>

                        {/* Remember me and Forgot password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 group-hover:border-indigo-400 transition-colors"
                                />
                                <span className="text-sm text-gray-600 group-hover:text-gray-900">Remember me</span>
                            </label>
                            <Link
                                to={ROUTES.FORGOT_PASSWORD}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline flex items-center gap-1"
                            >
                                Forgot password?
                                <ArrowRightIcon className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* General error message */}
                        {errors.general && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-3"
                            >
                                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                                <span>{errors.general}</span>
                            </motion.div>
                        )}

                        {/* Login attempts warning */}
                        {loginAttempts > 2 && loginAttempts < 5 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-yellow-600 text-center"
                            >
                                {5 - loginAttempts} login attempts remaining
                            </motion.p>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <LockClosedIcon className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>

                        {/* Register link */}
                        <p className="text-center text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to={ROUTES.REGISTER}
                                className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1 group"
                            >
                                Create free account
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </p>
                    </form>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500"
                >
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                        <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                        <span>Secure Login</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                        <LockClosedIcon className="w-4 h-4 text-blue-600" />
                        <span>256-bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                        <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                        <span>2FA Ready</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;