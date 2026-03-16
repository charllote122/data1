// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import authService from '../../services/auth';
import { ROUTES } from '../../constants/routes';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ArrowPathIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ArrowRightIcon,
    BeakerIcon,
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: authLogin } = useAuth();
    const { showNotification } = useNotification();

    // Get the page they were trying to access, or default to dashboard
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

    useEffect(() => {
        if (message) {
            showNotification('success', message);
            window.history.replaceState({}, document.title);
        }
    }, [message, showNotification]);

    // Debug - log where we're redirecting to
    useEffect(() => {
        console.log('📍 Login page loaded');
        console.log('📍 Redirect target:', from);
        console.log('📍 Stored tokens:', {
            access: !!localStorage.getItem('accessToken'),
            refresh: !!localStorage.getItem('refreshToken')
        });
    }, [from]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
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

            console.log('📤 Attempting login with:', loginData.username);

            const response = await authService.login(loginData);

            console.log('✅ Login successful, response:', response);

            // Call authLogin to update auth context
            authLogin(
                response.user,
                response.access,
                response.refresh,
                formData.remember
            );

            // Verify tokens were stored
            console.log('🔑 Tokens after login:', {
                access: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
                refresh: !!localStorage.getItem('refreshToken')
            });

            const userName = response.user.first_name || response.user.username;
            showNotification('success', `Welcome back, ${userName}!`);

            // IMPORTANT: Redirect to the page they were trying to access
            console.log('🔄 Redirecting to:', from);

            // Small delay to ensure auth state updates
            setTimeout(() => {
                navigate(from, { replace: true });
            }, 100);

        } catch (error) {
            console.error('❌ Login error:', error);

            setLoginAttempts(prev => prev + 1);

            if (error.status === 400) {
                if (error.errors?.non_field_errors) {
                    const errorMsg = error.errors.non_field_errors[0];

                    if (errorMsg.includes('verify')) {
                        setErrors({ general: 'Please verify your email before logging in.' });
                        showNotification('warning', 'Please verify your email before logging in.');
                    } else {
                        setErrors({ general: 'Invalid username or password' });
                        showNotification('error', 'Invalid username or password');
                    }
                } else if (error.errors) {
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

    // Function to check token after login
    const checkTokenStatus = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('No token found!');
            return;
        }

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            const isValid = now < expDate;

            console.log('📦 Token payload:', payload);
            console.log('⏰ Expires:', expDate.toLocaleString());
            console.log('✅ Valid:', isValid ? 'Yes' : 'No');

            alert(`Token valid: ${isValid ? '✅ Yes' : '❌ No'}\nExpires: ${expDate.toLocaleString()}`);
        } catch (e) {
            console.error('Error decoding token:', e);
            alert('Error decoding token: ' + e.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            {/* Back to Home */}
            <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
                <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-primary-600 transition-colors group px-2"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            {/* Centered Login Card */}
            <div className="flex items-center justify-center px-4 sm:px-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[90%] sm:max-w-md md:max-w-lg"
                >
                    <Card className="overflow-hidden p-0 shadow-xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                <div>
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Welcome Back</h1>
                                    <p className="text-primary-100 text-xs sm:text-sm mt-1">Sign in to continue your health journey</p>
                                </div>
                                <Badge variant="primary" className="bg-white/20 text-white border-white/30 text-xs sm:text-sm">
                                    Secure Login
                                </Badge>
                            </div>
                        </div>

                        {/* Success Message Banner */}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mx-4 sm:mx-6 md:mx-8 mt-4 sm:mt-6 p-3 sm:p-4 bg-success-50 border border-success-200 rounded-xl flex items-start gap-2 sm:gap-3"
                            >
                                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-success-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs sm:text-sm text-success-700">{message}</p>
                            </motion.div>
                        )}

                        {/* Debug info - only in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mx-4 sm:mx-6 md:mx-8 mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
                                <details>
                                    <summary className="cursor-pointer text-xs font-medium text-gray-700">
                                        🔧 Debug Info (Click to expand)
                                    </summary>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-xs">Redirect target: <span className="font-mono">{from}</span></p>
                                        <p className="text-xs">Token exists: {localStorage.getItem('accessToken') ? '✅' : '❌'}</p>
                                        <button
                                            onClick={checkTokenStatus}
                                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                        >
                                            Check Token
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Clear tokens and redirect to login
                                                localStorage.removeItem('accessToken');
                                                localStorage.removeItem('refreshToken');
                                                window.location.reload();
                                            }}
                                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                                        >
                                            Clear Tokens
                                        </button>
                                    </div>
                                </details>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 md:space-y-6">
                            {/* Username/Email field */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Username or Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('username')}
                                        disabled={loading}
                                        className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-xl focus:outline-none transition
                                            ${touchedFields.username && errors.username
                                                ? 'border-error-300 bg-error-50 focus:border-error-500'
                                                : 'border-gray-200 focus:border-primary-500'
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
                                        className="mt-1 text-xs sm:text-sm text-error-600 flex items-center gap-1"
                                    >
                                        <XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        {errors.username}
                                    </motion.p>
                                )}
                            </div>

                            {/* Password field */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('password')}
                                        disabled={loading}
                                        className={`w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-xl focus:outline-none transition
                                            ${touchedFields.password && errors.password
                                                ? 'border-error-300 bg-error-50 focus:border-error-500'
                                                : 'border-gray-200 focus:border-primary-500'
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
                                        {showPassword ?
                                            <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" /> :
                                            <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        }
                                    </button>
                                </div>
                                {touchedFields.password && errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-1 text-xs sm:text-sm text-error-600 flex items-center gap-1"
                                    >
                                        <XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        {errors.password}
                                    </motion.p>
                                )}
                            </div>

                            {/* Remember me and Forgot password */}
                            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 group-hover:border-primary-400 transition-colors"
                                    />
                                    <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-900">Remember me</span>
                                </label>
                                <Link
                                    to={ROUTES.FORGOT_PASSWORD}
                                    className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline flex items-center gap-1"
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
                                    className="p-3 sm:p-4 bg-error-50 border border-error-200 rounded-xl text-xs sm:text-sm text-error-600 flex items-start gap-2 sm:gap-3"
                                >
                                    <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                                    <span className="flex-1">{errors.general}</span>
                                </motion.div>
                            )}

                            {/* Login attempts warning */}
                            {loginAttempts > 2 && loginAttempts < 5 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-warning-600 text-center"
                                >
                                    {5 - loginAttempts} login {5 - loginAttempts === 1 ? 'attempt' : 'attempts'} remaining
                                </motion.p>
                            )}

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-medium text-sm sm:text-base hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>

                            {/* Register link */}
                            <p className="text-center text-xs sm:text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to={ROUTES.REGISTER}
                                    className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 group"
                                >
                                    Create free account
                                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </p>
                        </form>
                    </Card>

                    {/* Trust badges */}
                    <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 px-2">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-500">
                            <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm">Secure</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-500">
                            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm">Private</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-500 col-span-2 sm:col-span-1">
                            <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="text-xs sm:text-sm">Encrypted</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;