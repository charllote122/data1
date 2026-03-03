// src/pages/auth/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import authService from '../../services/auth';
import { ROUTES } from '../../constants/routes';
import {
    EnvelopeIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    PaperAirplaneIcon,
    ShieldCheckIcon,
    ClockIcon,
    InformationCircleIcon,
    KeyIcon,
    DevicePhoneMobileIcon,
    RefreshIcon,
    MailOpenIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

// Enhanced validation schema
const schema = yup.object({
    email: yup.string()
        .required('Email is required')
        .email('Please enter a valid email address')
        .matches(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please enter a valid email address (e.g., name@domain.com)'
        )
        .max(254, 'Email must not exceed 254 characters'),

    resetMethod: yup.string()
        .oneOf(['email', 'sms'], 'Invalid reset method')
        .default('email'),

    phoneNumber: yup.string()
        .when('resetMethod', {
            is: 'sms',
            then: (schema) => schema
                .required('Phone number is required for SMS reset')
                .matches(
                    /^\+?[1-9]\d{1,14}$/,
                    'Please enter a valid phone number with country code (e.g., +1234567890)'
                ),
            otherwise: (schema) => schema.notRequired()
        })
});

const ForgotPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [apiError, setApiError] = useState('');
    const [rateLimited, setRateLimited] = useState(false);
    const [cooldownSeconds, setCooldownSeconds] = useState(0);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resetMethod, setResetMethod] = useState('email');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const [lastAttemptTime, setLastAttemptTime] = useState(null);

    // Get email from location state (if coming from login page)
    const initialEmail = location.state?.email || '';

    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, trigger } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            email: initialEmail,
            resetMethod: 'email',
            phoneNumber: ''
        },
        mode: 'onChange'
    });

    const email = watch('email', '');
    const currentResetMethod = watch('resetMethod', 'email');
    const phoneNumber = watch('phoneNumber', '');

    // Handle cooldown timer for rate limiting
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

    // Handle resend cooldown timer
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Track attempts for progressive delay
    useEffect(() => {
        if (attemptCount > 0) {
            const delay = Math.min(attemptCount * 2, 30); // Max 30 seconds
            setCooldownSeconds(delay);
        }
    }, [attemptCount]);

    const onSubmit = async (data) => {
        // Check if enough time has passed since last attempt
        if (lastAttemptTime) {
            const timeSinceLastAttempt = (Date.now() - lastAttemptTime) / 1000;
            if (timeSinceLastAttempt < cooldownSeconds) {
                showNotification('info', `Please wait ${Math.ceil(cooldownSeconds - timeSinceLastAttempt)} seconds before trying again.`);
                return;
            }
        }

        setLoading(true);
        setApiError('');
        setRateLimited(false);
        setLastAttemptTime(Date.now());

        try {
            let response;

            if (data.resetMethod === 'email') {
                // Call the email password reset endpoint
                response = await authService.forgotPassword(data.email);
                console.log('✅ Password reset email sent:', response);

                showNotification(
                    'success',
                    'Password reset instructions have been sent to your email!'
                );
            } else {
                // Call the SMS password reset endpoint
                response = await authService.forgotPasswordSms({
                    phone: data.phoneNumber,
                    email: data.email
                });
                console.log('✅ Password reset SMS sent:', response);

                showNotification(
                    'success',
                    'Password reset code has been sent to your phone!'
                );
            }

            setSubmitted(true);
            setResendCooldown(60); // Enable resend after 60 seconds
            setAttemptCount(0); // Reset attempt count on success

            // Store the contact method for resend
            sessionStorage.setItem('reset_contact', data.resetMethod === 'email' ? data.email : data.phoneNumber);
            sessionStorage.setItem('reset_method', data.resetMethod);

        } catch (error) {
            console.error('❌ Password reset failed:', error);

            // Increment attempt count for progressive delay
            setAttemptCount(prev => prev + 1);

            // Handle rate limiting (429 status code)
            if (error.response?.status === 429) {
                setRateLimited(true);
                const retryAfter = error.response.headers?.['retry-after'] || 300;
                setCooldownSeconds(parseInt(retryAfter));

                setApiError(
                    `Too many requests. Please wait ${parseInt(retryAfter)} seconds before trying again.`
                );

                showNotification(
                    'error',
                    `Rate limit exceeded. Please wait ${parseInt(retryAfter)} seconds.`
                );

                // Handle user not found
            } else if (error.response?.status === 404) {
                setApiError('No account found with this email address.');
                showNotification('error', 'No account found with this email address.');

                // Handle validation errors
            } else if (error.response?.data?.email) {
                const errorMsg = Array.isArray(error.response.data.email)
                    ? error.response.data.email[0]
                    : error.response.data.email;
                setApiError(errorMsg);
                showNotification('error', errorMsg);

            } else if (error.response?.data?.phone) {
                const errorMsg = Array.isArray(error.response.data.phone)
                    ? error.response.data.phone[0]
                    : error.response.data.phone;
                setApiError(errorMsg);
                showNotification('error', errorMsg);

                // Handle other errors
            } else {
                const errorMessage = error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.response?.data?.detail ||
                    'Failed to send reset instructions. Please try again.';

                setApiError(errorMessage);
                showNotification('error', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) {
            showNotification(
                'info',
                `Please wait ${resendCooldown} seconds before requesting another ${resetMethod === 'email' ? 'email' : 'code'}.`
            );
            return;
        }

        // Get stored contact info
        const storedContact = sessionStorage.getItem('reset_contact');
        const storedMethod = sessionStorage.getItem('reset_method');

        if (storedMethod === 'email' && storedContact) {
            await onSubmit({ email: storedContact, resetMethod: 'email' });
        } else if (storedMethod === 'sms' && storedContact) {
            await onSubmit({
                email,
                resetMethod: 'sms',
                phoneNumber: storedContact
            });
        }
    };

    const handleTryDifferent = () => {
        setSubmitted(false);
        setApiError('');
        setRateLimited(false);
        setAttemptCount(0);
        // Clear the form
        setValue('email', '', { shouldValidate: false });
        setValue('phoneNumber', '', { shouldValidate: false });
        sessionStorage.removeItem('reset_contact');
        sessionStorage.removeItem('reset_method');
    };

    const handleMethodChange = (method) => {
        setResetMethod(method);
        setValue('resetMethod', method);
        setApiError('');
        // Trigger validation for the appropriate field
        if (method === 'sms') {
            trigger('phoneNumber');
        } else {
            trigger('email');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Animation variants
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                {/* Back to home link */}
                <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                    {/* Decorative Header */}
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600"></div>

                    <div className="px-8 py-10">
                        {/* Logo/Brand */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-8"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                                          bg-gradient-to-br from-blue-500 to-blue-600 text-white 
                                          shadow-lg shadow-blue-500/30 mb-4">
                                <KeyIcon className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Reset Password
                            </h2>
                            <p className="text-gray-600 mt-2">
                                Choose how you'd like to reset your password
                            </p>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {submitted ? (
                                /* Success State */
                                <motion.div
                                    key="success"
                                    variants={fadeInUp}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className="mb-6 flex justify-center"
                                    >
                                        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
                                            <MailOpenIcon className="w-10 h-10 text-green-600" />
                                        </div>
                                    </motion.div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {resetMethod === 'email' ? 'Check Your Email' : 'Check Your Phone'}
                                    </h3>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-green-50 rounded-xl p-6 mb-6 border border-green-200"
                                    >
                                        <p className="text-green-800 font-medium mb-2">
                                            We've sent instructions to:
                                        </p>
                                        <p className="text-green-700 font-mono bg-green-100/50 py-2 px-4 rounded-lg break-all">
                                            {resetMethod === 'email' ? email : phoneNumber}
                                        </p>
                                        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-700">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>Link expires in 24 hours</span>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        variants={staggerContainer}
                                        initial="initial"
                                        animate="animate"
                                        className="space-y-3"
                                    >
                                        <Link
                                            to={ROUTES.LOGIN}
                                            className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                                                     py-3 px-4 rounded-xl font-semibold
                                                     hover:from-blue-700 hover:to-blue-800 
                                                     focus:outline-none focus:ring-4 focus:ring-blue-300 
                                                     transition-all duration-200 transform hover:scale-[1.02]
                                                     shadow-lg shadow-blue-500/30
                                                     inline-flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeftIcon className="w-5 h-5" />
                                            Return to Login
                                        </Link>

                                        <motion.button
                                            variants={fadeInUp}
                                            onClick={handleTryDifferent}
                                            className="w-full text-gray-600 hover:text-gray-800 
                                                     py-2 px-4 rounded-lg text-sm font-medium
                                                     transition-colors"
                                            disabled={rateLimited}
                                        >
                                            Try a different {resetMethod === 'email' ? 'email' : 'phone number'}
                                        </motion.button>

                                        {/* Resend button with cooldown */}
                                        <motion.div variants={fadeInUp} className="pt-2">
                                            <button
                                                onClick={handleResend}
                                                disabled={resendCooldown > 0}
                                                className={`text-sm transition-colors flex items-center justify-center gap-2 mx-auto
                                                    ${resendCooldown > 0
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-blue-600 hover:text-blue-700'
                                                    }`}
                                            >
                                                <RefreshIcon className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'animate-spin'}`} />
                                                {resendCooldown > 0
                                                    ? `Resend available in ${formatTime(resendCooldown)}`
                                                    : 'Resend instructions'
                                                }
                                            </button>
                                        </motion.div>
                                    </motion.div>

                                    {/* Security Note */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                                    >
                                        <div className="flex items-start gap-3">
                                            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-700 text-left">
                                                <span className="font-medium">Didn't receive it?</span>
                                                <br />
                                                • Check your spam or promotions folder
                                                <br />
                                                • Add noreply@diabetespredictor.com to your contacts
                                                <br />
                                                • The {resetMethod === 'email' ? 'email' : 'message'} might take a few minutes to arrive
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                /* Form State */
                                <motion.div
                                    key="form"
                                    variants={fadeInUp}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {/* API Error Message */}
                                    <AnimatePresence>
                                        {apiError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl 
                                                         flex items-start gap-3"
                                            >
                                                <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-700">{apiError}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Rate Limiting Message */}
                                    <AnimatePresence>
                                        {rateLimited && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl 
                                                         flex items-start gap-3"
                                            >
                                                <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-yellow-700 font-medium">
                                                        Too many requests
                                                    </p>
                                                    <p className="text-xs text-yellow-600 mt-1">
                                                        Please wait {formatTime(cooldownSeconds)} before trying again.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Reset Method Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Reset Method
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleMethodChange('email')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                                                    ${currentResetMethod === 'email'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <EnvelopeIcon className="w-5 h-5" />
                                                <span className="text-sm font-medium">Email</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMethodChange('sms')}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all
                                                    ${currentResetMethod === 'sms'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <DevicePhoneMobileIcon className="w-5 h-5" />
                                                <span className="text-sm font-medium">SMS</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
                                    >
                                        <p className="text-sm text-blue-700 flex items-start gap-2">
                                            <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            <span>
                                                {currentResetMethod === 'email'
                                                    ? "We'll send a password reset link to your email address. The link will expire in 24 hours."
                                                    : "We'll send a verification code to your phone. Enter it on the next page to reset your password."
                                                }
                                            </span>
                                        </p>
                                    </motion.div>

                                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                                        {/* Email Field (always shown for account lookup) */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Account Email
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <EnvelopeIcon className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'
                                                        }`} />
                                                </div>
                                                <input
                                                    {...register('email')}
                                                    type="email"
                                                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                               focus:outline-none focus:ring-4 transition-all duration-200
                                                               ${errors.email
                                                            ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                            : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                                                        }
                                                               ${loading || rateLimited ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                    placeholder="you@example.com"
                                                    disabled={loading || rateLimited}
                                                    autoComplete="email"
                                                    aria-invalid={!!errors.email}
                                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                                />
                                            </div>
                                            {errors.email && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    id="email-error"
                                                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                                                >
                                                    <ExclamationCircleIcon className="w-4 h-4" />
                                                    {errors.email.message}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Phone Number Field (conditional) */}
                                        <AnimatePresence>
                                            {currentResetMethod === 'sms' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Phone Number <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <DevicePhoneMobileIcon className={`h-5 w-5 ${errors.phoneNumber ? 'text-red-400' : 'text-gray-400'
                                                                }`} />
                                                        </div>
                                                        <input
                                                            {...register('phoneNumber')}
                                                            type="tel"
                                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                                       focus:outline-none focus:ring-4 transition-all duration-200
                                                                       ${errors.phoneNumber
                                                                    ? 'border-red-300 focus:ring-red-100 focus:border-red-500'
                                                                    : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'
                                                                }
                                                                       ${loading || rateLimited ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                            placeholder="+1234567890"
                                                            disabled={loading || rateLimited}
                                                            autoComplete="tel"
                                                        />
                                                    </div>
                                                    {errors.phoneNumber && (
                                                        <motion.p
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="mt-2 text-sm text-red-600 flex items-center gap-1"
                                                        >
                                                            <ExclamationCircleIcon className="w-4 h-4" />
                                                            {errors.phoneNumber.message}
                                                        </motion.p>
                                                    )}
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Include country code (e.g., +1 for US)
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Submit Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading || rateLimited || isSubmitting}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                                                     py-3 px-4 rounded-xl font-semibold text-lg
                                                     hover:from-blue-700 hover:to-blue-800 
                                                     focus:outline-none focus:ring-4 focus:ring-blue-300 
                                                     disabled:opacity-50 disabled:cursor-not-allowed
                                                     transition-all duration-200 transform hover:scale-[1.02]
                                                     shadow-lg shadow-blue-500/30
                                                     flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : rateLimited ? (
                                                <>
                                                    <ClockIcon className="w-5 h-5" />
                                                    <span>Wait {formatTime(cooldownSeconds)}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Send Reset {currentResetMethod === 'email' ? 'Link' : 'Code'}</span>
                                                    <PaperAirplaneIcon className="w-5 h-5" />
                                                </>
                                            )}
                                        </motion.button>

                                        {/* Advanced Options Toggle */}
                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={() => setShowAdvanced(!showAdvanced)}
                                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
                                            >
                                                <InformationCircleIcon className="w-4 h-4" />
                                                {showAdvanced ? 'Hide' : 'Show'} advanced options
                                            </button>
                                        </div>

                                        {/* Advanced Options */}
                                        <AnimatePresence>
                                            {showAdvanced && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2"
                                                >
                                                    <h4 className="text-xs font-medium text-gray-700 mb-2">Troubleshooting</h4>
                                                    <p className="text-xs text-gray-600 flex items-start gap-2">
                                                        <LockClosedIcon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <span>Make sure you can access the email or phone number associated with your account</span>
                                                    </p>
                                                    <p className="text-xs text-gray-600 flex items-start gap-2">
                                                        <ClockIcon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                                        <span>Reset links expire after 24 hours for security</span>
                                                    </p>
                                                    <div className="border-t border-gray-200 my-2"></div>
                                                    <Link
                                                        to="/contact"
                                                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline block text-center"
                                                    >
                                                        Still having trouble? Contact Support
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Back to Login Link */}
                                        <div className="text-center">
                                            <Link
                                                to={ROUTES.LOGIN}
                                                className="inline-flex items-center gap-2 text-sm text-gray-600 
                                                           hover:text-blue-600 transition-colors group"
                                            >
                                                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                                Back to Login
                                            </Link>
                                        </div>
                                    </form>

                                    {/* Need help? */}
                                    <div className="mt-6 text-center">
                                        <p className="text-xs text-gray-500">
                                            Need help? {' '}
                                            <Link
                                                to="/contact"
                                                className="text-blue-600 hover:text-blue-700 hover:underline"
                                            >
                                                Contact Support
                                            </Link>
                                        </p>
                                    </div>

                                    {/* Development Info */}
                                    {import.meta.env.DEV && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
                                        >
                                            <p className="text-xs text-gray-500 font-mono text-center">
                                                <span className="font-bold text-gray-700">Dev Mode:</span>{' '}
                                                {currentResetMethod === 'email'
                                                    ? 'Password reset emails appear in console/terminal'
                                                    : 'SMS codes appear in console (twilio simulator)'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500 text-center mt-1 break-all">
                                                API: {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}
                                            </p>
                                            <p className="text-xs text-gray-500 text-center mt-1">
                                                Attempts: {attemptCount}/5
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
                        <span>Secure Reset</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                        <ClockIcon className="w-4 h-4 text-blue-600" />
                        <span>24h Link Expiry</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm">
                        <KeyIcon className="w-4 h-4 text-purple-600" />
                        <span>Multi-factor Auth</span>
                    </div>
                </motion.div>

                {/* Security note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 text-center text-xs text-gray-400"
                >
                    We'll never ask for your password via email or SMS
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;