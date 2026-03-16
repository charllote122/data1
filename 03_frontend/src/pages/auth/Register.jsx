// src/pages/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    CalendarIcon,
    HeartIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowLeftIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    DevicePhoneMobileIcon,
    ArrowRightIcon,
    ScaleIcon,
    ArrowsUpDownIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

// ============================================
// Date formatting utilities
// ============================================
const formatDateForInput = (date) => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
};

const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

const calculateAge = (dob) => {
    if (!dob) return null;
    try {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (error) {
        return null;
    }
};

// Validation schema
const schema = yup.object({
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),

    email: yup
        .string()
        .required('Email is required')
        .email('Enter a valid email address'),

    password: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Include at least one uppercase letter')
        .matches(/[a-z]/, 'Include at least one lowercase letter')
        .matches(/[0-9]/, 'Include at least one number'),

    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),

    firstName: yup.string().optional(),
    lastName: yup.string().optional(),

    phoneNumber: yup
        .string()
        .optional()
        .matches(/^\+?[1-9]\d{1,14}$/, 'Enter a valid phone number with country code'),

    dateOfBirth: yup
        .date()
        .nullable()
        .transform((value, originalValue) => {
            if (!originalValue) return null;
            const date = new Date(originalValue);
            return isNaN(date.getTime()) ? null : date;
        })
        .max(new Date(), 'Date of birth cannot be in the future')
        .test('age', 'You must be at least 13 years old', (value) => {
            if (!value) return true;
            const age = calculateAge(value);
            return age >= 13;
        }),

    height: yup
        .number()
        .nullable()
        .transform((value) => (isNaN(value) ? null : value))
        .min(50, 'Height must be between 50-300cm')
        .max(300, 'Height must be between 50-300cm')
        .typeError('Height must be a number'),

    weight: yup
        .number()
        .nullable()
        .transform((value) => (isNaN(value) ? null : value))
        .min(20, 'Weight must be between 20-500kg')
        .max(500, 'Weight must be between 20-500kg')
        .typeError('Weight must be a number'),

    acceptTerms: yup
        .boolean()
        .oneOf([true], 'You must accept the terms to continue')
});

const Register = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [serverErrors, setServerErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [bmi, setBmi] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        setValue,
        formState: { errors, isValid }
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            dateOfBirth: null,
            height: null,
            weight: null
        }
    });

    const watchFields = watch();

    // Calculate BMI when height or weight changes
    useEffect(() => {
        if (watchFields.height && watchFields.weight) {
            const heightInMeters = parseFloat(watchFields.height) / 100;
            const weight = parseFloat(watchFields.weight);
            if (heightInMeters > 0 && weight > 0) {
                const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
                setBmi(bmiValue);
            } else {
                setBmi(null);
            }
        } else {
            setBmi(null);
        }
    }, [watchFields.height, watchFields.weight]);

    // Scroll to first error when server errors appear
    useEffect(() => {
        if (Object.keys(serverErrors).length > 0) {
            const firstErrorField = Object.keys(serverErrors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }
    }, [serverErrors]);

    const getBmiCategory = (bmi) => {
        if (!bmi) return null;
        const num = parseFloat(bmi);
        if (num < 18.5) return { label: 'Underweight', variant: 'info' };
        if (num < 25) return { label: 'Healthy', variant: 'success' };
        if (num < 30) return { label: 'Overweight', variant: 'warning' };
        return { label: 'Obese', variant: 'error' };
    };

    const nextStep = async () => {
        let fieldsToValidate = [];
        if (step === 1) {
            fieldsToValidate = ['username', 'email', 'password', 'confirmPassword'];
        } else if (step === 2) {
            fieldsToValidate = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'height', 'weight'];
        }

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showNotification('error', 'Please fill in all required fields correctly');
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFieldChange = (field) => {
        if (serverErrors[field]) {
            setServerErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        if (field === 'dateOfBirth' && serverErrors.date_of_birth) {
            setServerErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.date_of_birth;
                return newErrors;
            });
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setServerErrors({});
        setValidationErrors({});

        try {
            // Format date properly
            let formattedDate = null;
            if (data.dateOfBirth) {
                const date = new Date(data.dateOfBirth);
                if (!isNaN(date.getTime())) {
                    formattedDate = date.toISOString().split('T')[0];
                }
            }

            const submitData = {
                username: data.username.trim(),
                email: data.email.trim().toLowerCase(),
                password: data.password,
                password2: data.confirmPassword,
                first_name: data.firstName?.trim() || '',
                last_name: data.lastName?.trim() || '',
                phone_number: data.phoneNumber ? data.phoneNumber.replace(/[\s()-]/g, '') : null,
                date_of_birth: formattedDate,
                height: data.height ? parseFloat(data.height) : null,
                weight: data.weight ? parseFloat(data.weight) : null
            };

            console.log('📤 Submitting registration data:', submitData);

            const response = await api.register(submitData);
            console.log('📥 Registration response:', response);

            setRegisteredEmail(data.email);
            setRegistrationSuccess(true);
            showNotification('success', 'Registration successful! Your account has been created.');

        } catch (error) {
            console.error('❌ Registration failed:', error);

            // Log the full error object to see its structure
            console.log('Error details:', JSON.stringify(error, null, 2));

            // Handle different error formats
            if (error.errors) {
                // Set server errors for form fields
                setServerErrors(error.errors);

                // Show first error as notification
                const firstErrorKey = Object.keys(error.errors)[0];
                const firstError = error.errors[firstErrorKey];
                const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;

                // Special messages for specific fields
                if (firstErrorKey === 'username' && errorMessage.includes('already exists')) {
                    showNotification('error', 'Username already taken. Please choose another.');
                } else if (firstErrorKey === 'email' && errorMessage.includes('already exists')) {
                    showNotification('error', 'Email already registered. Please use another or login.');
                } else if (firstErrorKey === 'password') {
                    showNotification('error', 'Password: ' + errorMessage);
                } else if (firstErrorKey === 'date_of_birth') {
                    showNotification('error', 'Please select a valid date of birth.');
                } else {
                    showNotification('error', errorMessage);
                }
            } else if (error.message) {
                // Generic error message
                showNotification('error', error.message);

                // Try to parse validation errors from message
                if (error.message.includes('Validation failed') && error.details) {
                    setValidationErrors(error.details);
                }
            } else {
                showNotification('error', 'Registration failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success Screen
    if (registrationSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center p-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                    >
                        <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircleIcon className="w-10 h-10 text-success-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful! 🎉</h2>
                        <p className="text-gray-600 mb-4">
                            Your account has been created for:
                        </p>
                        <p className="font-semibold text-primary-600 bg-primary-50 py-3 px-4 rounded-lg mb-6 break-all">
                            {registeredEmail}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            You can now log in with your credentials.
                        </p>

                        <Link
                            to={ROUTES.LOGIN}
                            state={{
                                email: registeredEmail,
                                message: 'Account created successfully! You can now log in.'
                            }}
                            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Go to Login
                            <ArrowRightIcon className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors group"
                >
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <Card className="overflow-hidden p-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Create Account</h1>
                                <p className="text-primary-100 mt-2">Join thousands of users tracking their health journey</p>
                            </div>
                            <Badge variant="primary" className="bg-white/20 text-white border-white/30">
                                Free forever
                            </Badge>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-8 pt-6 pb-4 border-b border-gray-200">
                        <div className="flex items-center justify-between max-w-md mx-auto">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className="flex items-center">
                                    <motion.div
                                        initial={{ scale: 1 }}
                                        animate={{ scale: step === num ? 1.1 : 1 }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all
                                            ${step > num
                                                ? 'bg-success-500 text-white'
                                                : step === num
                                                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                                    : 'bg-gray-200 text-gray-600'}`}
                                    >
                                        {step > num ? <CheckCircleIcon className="w-5 h-5" /> : num}
                                    </motion.div>
                                    {num < 3 && (
                                        <motion.div
                                            initial={{ width: '4rem' }}
                                            animate={{ width: step > num ? '4rem' : '4rem' }}
                                            className={`h-1 mx-2 rounded transition-colors
                                                ${step > num ? 'bg-success-500' : 'bg-gray-200'}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-500">
                            <span>Account</span>
                            <span>Profile</span>
                            <span>Review</span>
                        </div>
                    </div>

                    {/* Server Error Summary */}
                    {Object.keys(serverErrors).length > 0 && (
                        <div className="mx-8 mt-6 p-4 bg-error-50 border border-error-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-error-800 mb-2">
                                        Please fix the following errors:
                                    </h4>
                                    <ul className="text-xs text-error-700 space-y-1 list-disc list-inside">
                                        {Object.entries(serverErrors).map(([field, messages]) => (
                                            <li key={field}>
                                                <span className="font-medium capitalize">{field.replace('_', ' ')}:</span>{' '}
                                                {Array.isArray(messages) ? messages.join(', ') : messages}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validation Error Summary */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mx-8 mt-6 p-4 bg-warning-50 border border-warning-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-warning-800 mb-2">
                                        Validation issues:
                                    </h4>
                                    <ul className="text-xs text-warning-700 space-y-1 list-disc list-inside">
                                        {Object.entries(validationErrors).map(([field, message]) => (
                                            <li key={field}>
                                                <span className="font-medium capitalize">{field}:</span> {message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                        {/* Step 1: Account Information */}
                        {step === 1 && (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-5"
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Information</h2>

                                <div className="grid md:grid-cols-2 gap-5">
                                    {/* Username */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Username <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('username')}
                                                onChange={(e) => {
                                                    register('username').onChange(e);
                                                    handleFieldChange('username');
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.username || serverErrors.username
                                                        ? 'border-error-300 focus:border-error-500 bg-error-50'
                                                        : 'border-gray-200 focus:border-primary-500'}`}
                                                placeholder="johndoe"
                                            />
                                        </div>
                                        {(errors.username || serverErrors.username) && (
                                            <p className="text-sm text-error-600 flex items-center gap-1 mt-1">
                                                <XCircleIcon className="w-4 h-4" />
                                                {errors.username?.message || (serverErrors.username &&
                                                    (Array.isArray(serverErrors.username) ? serverErrors.username[0] : serverErrors.username))}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('email')}
                                                type="email"
                                                onChange={(e) => {
                                                    register('email').onChange(e);
                                                    handleFieldChange('email');
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.email || serverErrors.email
                                                        ? 'border-error-300 focus:border-error-500 bg-error-50'
                                                        : 'border-gray-200 focus:border-primary-500'}`}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        {(errors.email || serverErrors.email) && (
                                            <p className="text-sm text-error-600 flex items-center gap-1 mt-1">
                                                <XCircleIcon className="w-4 h-4" />
                                                {errors.email?.message || (serverErrors.email &&
                                                    (Array.isArray(serverErrors.email) ? serverErrors.email[0] : serverErrors.email))}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    {/* Password */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                onChange={(e) => {
                                                    register('password').onChange(e);
                                                    handleFieldChange('password');
                                                }}
                                                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.password
                                                        ? 'border-error-300 focus:border-error-500 bg-error-50'
                                                        : 'border-gray-200 focus:border-primary-500'}`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-error-600 flex items-center gap-1 mt-1">
                                                <XCircleIcon className="w-4 h-4" />
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('confirmPassword')}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                onChange={(e) => {
                                                    register('confirmPassword').onChange(e);
                                                    handleFieldChange('confirmPassword');
                                                }}
                                                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.confirmPassword
                                                        ? 'border-error-300 focus:border-error-500 bg-error-50'
                                                        : 'border-gray-200 focus:border-primary-500'}`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-sm text-error-600 flex items-center gap-1 mt-1">
                                                <XCircleIcon className="w-4 h-4" />
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Personal Information */}
                        {step === 2 && (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-5"
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                                    Personal Information <span className="text-sm font-normal text-gray-500">(Optional)</span>
                                </h2>

                                <div className="grid md:grid-cols-2 gap-5">
                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                        <input
                                            {...register('firstName')}
                                            onChange={(e) => {
                                                register('firstName').onChange(e);
                                                handleFieldChange('firstName');
                                            }}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                                            placeholder="John"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                        <input
                                            {...register('lastName')}
                                            onChange={(e) => {
                                                register('lastName').onChange(e);
                                                handleFieldChange('lastName');
                                            }}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition"
                                            placeholder="Doe"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="relative">
                                            <DevicePhoneMobileIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('phoneNumber')}
                                                onChange={(e) => {
                                                    register('phoneNumber').onChange(e);
                                                    handleFieldChange('phoneNumber');
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.phoneNumber ? 'border-error-300 bg-error-50' : 'border-gray-200 focus:border-primary-500'}`}
                                                placeholder="+1234567890"
                                            />
                                        </div>
                                        {errors.phoneNumber && (
                                            <p className="text-sm text-error-600 mt-1">{errors.phoneNumber.message}</p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('dateOfBirth')}
                                                type="date"
                                                onChange={(e) => {
                                                    register('dateOfBirth').onChange(e);
                                                    handleFieldChange('dateOfBirth');
                                                    setValue('dateOfBirth', e.target.value ? new Date(e.target.value) : null);
                                                }}
                                                max={formatDateForInput(new Date())}
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.dateOfBirth || serverErrors.date_of_birth ? 'border-error-300 bg-error-50' : 'border-gray-200 focus:border-primary-500'}`}
                                            />
                                        </div>
                                        {(errors.dateOfBirth || serverErrors.date_of_birth) && (
                                            <p className="text-sm text-error-600 mt-1">
                                                {errors.dateOfBirth?.message || (serverErrors.date_of_birth &&
                                                    (Array.isArray(serverErrors.date_of_birth) ? serverErrors.date_of_birth[0] : serverErrors.date_of_birth))}
                                            </p>
                                        )}
                                    </div>

                                    {/* Height */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                        <div className="relative">
                                            <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('height')}
                                                type="number"
                                                step="0.1"
                                                onChange={(e) => {
                                                    register('height').onChange(e);
                                                    handleFieldChange('height');
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.height ? 'border-error-300 bg-error-50' : 'border-gray-200 focus:border-primary-500'}`}
                                                placeholder="170"
                                            />
                                        </div>
                                        {errors.height && (
                                            <p className="text-sm text-error-600 mt-1">{errors.height.message}</p>
                                        )}
                                    </div>

                                    {/* Weight */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                        <div className="relative">
                                            <ScaleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                {...register('weight')}
                                                type="number"
                                                step="0.1"
                                                onChange={(e) => {
                                                    register('weight').onChange(e);
                                                    handleFieldChange('weight');
                                                }}
                                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.weight ? 'border-error-300 bg-error-50' : 'border-gray-200 focus:border-primary-500'}`}
                                                placeholder="70"
                                            />
                                        </div>
                                        {errors.weight && (
                                            <p className="text-sm text-error-600 mt-1">{errors.weight.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* BMI Display */}
                                {bmi && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4"
                                    >
                                        <Card variant="primary" padding="md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600">Your BMI</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {bmi} <span className="text-sm font-normal text-gray-500">kg/m²</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Category</p>
                                                    <Badge variant={getBmiCategory(bmi)?.variant} size="md">
                                                        {getBmiCategory(bmi)?.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 3: Review & Terms */}
                        {step === 3 && (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="space-y-5"
                            >
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Review & Confirm</h2>

                                <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
                                    {/* Account Details */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                            <UserIcon className="w-4 h-4" />
                                            Account Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg border border-gray-100">
                                            <div>
                                                <span className="text-gray-500 block">Username:</span>
                                                <span className="font-medium text-gray-900">{watchFields.username}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Email:</span>
                                                <span className="font-medium text-gray-900">{watchFields.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Information */}
                                    {(watchFields.firstName || watchFields.lastName || watchFields.phoneNumber || watchFields.dateOfBirth || bmi) && (
                                        <div>
                                            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                                <HeartIcon className="w-4 h-4" />
                                                Personal Information
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm bg-white p-3 rounded-lg border border-gray-100">
                                                {(watchFields.firstName || watchFields.lastName) && (
                                                    <div>
                                                        <span className="text-gray-500 block">Name:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {watchFields.firstName} {watchFields.lastName}
                                                        </span>
                                                    </div>
                                                )}
                                                {watchFields.phoneNumber && (
                                                    <div>
                                                        <span className="text-gray-500 block">Phone:</span>
                                                        <span className="font-medium text-gray-900">{watchFields.phoneNumber}</span>
                                                    </div>
                                                )}
                                                {watchFields.dateOfBirth && (
                                                    <div>
                                                        <span className="text-gray-500 block">Date of Birth:</span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatDateForDisplay(watchFields.dateOfBirth)}
                                                            {calculateAge(watchFields.dateOfBirth) && (
                                                                <span className="text-gray-500 ml-1">
                                                                    ({calculateAge(watchFields.dateOfBirth)} years)
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {bmi && (
                                                    <div>
                                                        <span className="text-gray-500 block">BMI:</span>
                                                        <Badge variant={getBmiCategory(bmi)?.variant} size="sm">
                                                            {bmi} - {getBmiCategory(bmi)?.label}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Terms agreement */}
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl cursor-pointer group border border-primary-100">
                                        <input
                                            {...register('acceptTerms')}
                                            type="checkbox"
                                            onChange={(e) => {
                                                register('acceptTerms').onChange(e);
                                                handleFieldChange('acceptTerms');
                                            }}
                                            className="mt-1 w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-gray-700">
                                            I agree to the{' '}
                                            <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                                                Privacy Policy
                                            </Link>
                                            . <span className="text-red-500">*</span>
                                        </span>
                                    </label>
                                    {errors.acceptTerms && (
                                        <p className="text-sm text-error-600 flex items-center gap-1">
                                            <XCircleIcon className="w-4 h-4" />
                                            {errors.acceptTerms.message}
                                        </p>
                                    )}
                                </div>

                                {/* Verification Notice */}
                                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3 border border-blue-200">
                                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800">Account Created Instantly</h4>
                                        <p className="text-xs text-blue-600">
                                            Your account will be activated immediately. No email verification required.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                >
                                    Back
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="ml-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                >
                                    Continue
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isValid}
                                    className="ml-auto px-8 py-3 bg-gradient-to-r from-success-600 to-success-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Create Account
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Login Link */}
                        {step === 1 && (
                            <p className="text-center text-gray-600">
                                Already have an account?{' '}
                                <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Register;