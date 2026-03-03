// src/pages/prediction/PredictionForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useHealth } from '../../context/HealthContext';
import { useNotification } from '../../context/NotificationContext';
import predictionsService from '../../services/predictions';
import SignupPrompt from '../../components/SignupPrompt';
import FormSteps from '../../components/FormSteps';
import { ROUTES } from '../../constants/routes';
import {
    UserIcon, HeartIcon, BeakerIcon, DocumentTextIcon,
    ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon,
    InformationCircleIcon, ChevronRightIcon, ChevronLeftIcon,
    ShieldCheckIcon, ClockIcon, SparklesIcon
} from '@heroicons/react/24/outline';

// Form steps configuration
const formSteps = [
    {
        id: 'demographics',
        name: 'Demographics',
        description: 'Basic information'
    },
    {
        id: 'health',
        name: 'Health Status',
        description: 'Current health metrics'
    },
    {
        id: 'lifestyle',
        name: 'Lifestyle',
        description: 'Habits & measurements'
    },
    {
        id: 'review',
        name: 'Review',
        description: 'Confirm details'
    }
];

const PredictionForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { profile, loading: profileLoading } = useHealth();
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);
    const [remainingPredictions, setRemainingPredictions] = useState(3);
    const [currentStep, setCurrentStep] = useState(1);
    const [featureInfo, setFeatureInfo] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [formData, setFormData] = useState({
        // Demographics
        age: '',
        gender: '',
        education: '4',
        income: '5',

        // Health status
        genHlth: '3',
        mentHlth: '0',
        physHlth: '0',

        // Chronic conditions
        highBP: false,
        highChol: false,
        stroke: false,
        heartDisease: false,

        // Lifestyle
        height: '',
        weight: '',
        bmi: '',
        smoker: false,
        physActivity: true,
        fruits: true,
        veggies: true,
        heavyAlcohol: false,

        // Healthcare access
        anyHealthcare: true,
        noDocCost: false,
        cholCheck: true,

        // Functional status
        diffWalk: false
    });

    // Load user profile data when available
    useEffect(() => {
        if (user && profile && !profileLoaded) {
            console.log('📝 Loading user profile data into form:', profile);

            // Calculate age from date_of_birth if available
            let calculatedAge = '';
            if (profile.date_of_birth) {
                const birthDate = new Date(profile.date_of_birth);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                calculatedAge = age.toString();
            }

            // Map gender from profile (assuming 0=female, 1=male in backend)
            let genderValue = '';
            if (profile.gender !== undefined && profile.gender !== null) {
                genderValue = profile.gender === 1 ? 'male' : profile.gender === 0 ? 'female' : '';
            }

            setFormData(prev => ({
                ...prev,
                // Pre-fill from user profile
                age: calculatedAge || prev.age,
                gender: genderValue || prev.gender,
                height: profile.height?.toString() || prev.height,
                weight: profile.weight?.toString() || prev.weight,
                // BMI will be auto-calculated from height/weight
            }));

            setProfileLoaded(true);

            // Show notification that profile data was loaded
            showNotification('info', 'Your profile data has been pre-filled. You can update it for this assessment.');
        }
    }, [user, profile, profileLoaded, showNotification]);

    // Load saved form data from location state (if coming from login)
    useEffect(() => {
        if (location.state?.savedData) {
            setFormData(location.state.savedData);
            showNotification('info', 'Your form data has been restored. Please continue.');
        }
    }, [location.state, showNotification]);

    useEffect(() => {
        // Load feature info on mount
        loadFeatureInfo();

        // Check remaining predictions for public users
        const remaining = localStorage.getItem('remaining_predictions');
        if (remaining) {
            setRemainingPredictions(parseInt(remaining));
        }
    }, []);

    // Auto-calculate BMI when height or weight changes
    useEffect(() => {
        if (formData.height && formData.weight) {
            const heightInMeters = parseFloat(formData.height) / 100;
            const weight = parseFloat(formData.weight);
            if (heightInMeters > 0 && weight > 0) {
                const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
                setFormData(prev => ({ ...prev, bmi: bmiValue }));
            }
        }
    }, [formData.height, formData.weight]);

    const loadFeatureInfo = async () => {
        try {
            const info = await predictionsService.getFeatureInfo();
            setFeatureInfo(info);
        } catch (error) {
            console.error('Failed to load feature info:', error);
            // Set default feature info as fallback
            setFeatureInfo({
                age_importance: true,
                bmi_importance: true,
                gender_options: ['male', 'female'],
                education_options: [
                    { value: 1, label: 'Never attended' },
                    { value: 2, label: 'Elementary' },
                    { value: 3, label: 'Some high school' },
                    { value: 4, label: 'High school graduate' },
                    { value: 5, label: 'Some college' },
                    { value: 6, label: 'College graduate' }
                ],
                income_options: [
                    { value: 1, label: 'Less than $10,000' },
                    { value: 2, label: '$10,000 - $15,000' },
                    { value: 3, label: '$15,000 - $20,000' },
                    { value: 4, label: '$20,000 - $25,000' },
                    { value: 5, label: '$25,000 - $35,000' },
                    { value: 6, label: '$35,000 - $50,000' },
                    { value: 7, label: '$50,000 - $75,000' },
                    { value: 8, label: 'More than $75,000' }
                ],
                health_rating_options: [
                    { value: 1, label: 'Excellent' },
                    { value: 2, label: 'Very Good' },
                    { value: 3, label: 'Good' },
                    { value: 4, label: 'Fair' },
                    { value: 5, label: 'Poor' }
                ]
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const calculateBMI = (data) => {
        if (data.height && data.weight) {
            const heightInMeters = parseFloat(data.height) / 100;
            const weight = parseFloat(data.weight);
            if (heightInMeters > 0 && weight > 0) {
                return (weight / (heightInMeters * heightInMeters)).toFixed(1);
            }
        }
        return '';
    };

    const validateStep = (step) => {
        const stepErrors = {};

        if (step === 1) {
            // Demographics validation
            if (!formData.age) {
                stepErrors.age = 'Age is required';
            } else if (formData.age < 18 || formData.age > 120) {
                stepErrors.age = 'Age must be between 18 and 120';
            } else if (isNaN(formData.age)) {
                stepErrors.age = 'Age must be a number';
            }

            if (!formData.gender) {
                stepErrors.gender = 'Gender is required';
            } else if (!['male', 'female'].includes(formData.gender)) {
                stepErrors.gender = 'Please select a valid gender';
            }
        }

        if (step === 2) {
            // Health status validation
            if (!formData.genHlth) {
                stepErrors.genHlth = 'General health is required';
            }
            if (formData.mentHlth < 0 || formData.mentHlth > 30) {
                stepErrors.mentHlth = 'Must be between 0 and 30';
            }
            if (formData.physHlth < 0 || formData.physHlth > 30) {
                stepErrors.physHlth = 'Must be between 0 and 30';
            }
        }

        if (step === 3) {
            // Lifestyle validation
            if (!formData.height) {
                stepErrors.height = 'Height is required';
            } else if (formData.height < 50 || formData.height > 300) {
                stepErrors.height = 'Height must be between 50cm and 300cm';
            } else if (isNaN(formData.height)) {
                stepErrors.height = 'Height must be a number';
            }

            if (!formData.weight) {
                stepErrors.weight = 'Weight is required';
            } else if (formData.weight < 20 || formData.weight > 500) {
                stepErrors.weight = 'Weight must be between 20kg and 500kg';
            } else if (isNaN(formData.weight)) {
                stepErrors.weight = 'Weight must be a number';
            }
        }

        return stepErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setValidationErrors(stepErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setCurrentStep(prev => prev + 1);
        setValidationErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setValidationErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Final validation before submit
        const finalErrors = validateStep(currentStep);
        if (Object.keys(finalErrors).length > 0) {
            setValidationErrors(finalErrors);
            showNotification('error', 'Please fix the validation errors before submitting');
            return;
        }

        // Check if user can make prediction
        if (!user && remainingPredictions <= 0) {
            setShowSignupPrompt(true);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // Calculate BMI if not already calculated
            const calculatedBMI = formData.bmi || calculateBMI(formData);

            // Prepare data for API - MATCHING BACKEND FIELD NAMES EXACTLY
            const submitData = {
                // Demographics
                Age: parseInt(formData.age),
                Sex: formData.gender === 'male' ? 1 : 0,  // 1 for male, 0 for female
                Education: parseInt(formData.education),
                Income: parseInt(formData.income),

                // Health status
                GenHlth: parseInt(formData.genHlth),
                MentHlth: parseInt(formData.mentHlth),
                PhysHlth: parseInt(formData.physHlth),

                // Chronic conditions (all 1 or 0)
                HighBP: formData.highBP ? 1 : 0,
                HighChol: formData.highChol ? 1 : 0,
                Stroke: formData.stroke ? 1 : 0,
                HeartDiseaseorAttack: formData.heartDisease ? 1 : 0,

                // Physical measurements
                BMI: calculatedBMI ? parseFloat(calculatedBMI) : 25,

                // Lifestyle factors (all 1 or 0)
                Smoker: formData.smoker ? 1 : 0,
                PhysActivity: formData.physActivity ? 1 : 0,
                Fruits: formData.fruits ? 1 : 0,
                Veggies: formData.veggies ? 1 : 0,
                HvyAlcoholConsump: formData.heavyAlcohol ? 1 : 0,

                // Healthcare access (all 1 or 0)
                AnyHealthcare: formData.anyHealthcare ? 1 : 0,
                NoDocbcCost: formData.noDocCost ? 1 : 0,
                CholCheck: formData.cholCheck ? 1 : 0,

                // Functional status (1 or 0)
                DiffWalk: formData.diffWalk ? 1 : 0
            };

            console.log('📤 Submitting data to backend:', submitData);
            console.log('📤 Data types:', Object.keys(submitData).reduce((acc, key) => {
                acc[key] = typeof submitData[key];
                return acc;
            }, {}));

            let result;

            if (user) {
                // Authenticated prediction
                console.log('Creating authenticated prediction');
                result = await predictionsService.createPrediction(submitData);

                showNotification('success', 'Assessment completed successfully!');

                // Navigate to detailed results page
                navigate(ROUTES.PREDICTIONS.DETAIL.replace(':id', result.id), {
                    state: { result }
                });
            } else {
                // Public prediction
                console.log('Creating public prediction');
                result = await predictionsService.getPublicPrediction(submitData);

                console.log('API Response:', result);

                // The API returns result with prediction and meta
                const predictionResult = result.prediction || result;

                console.log('Prediction result:', predictionResult);

                // Update remaining predictions from meta data
                if (result.meta?.remaining_attempts !== undefined) {
                    setRemainingPredictions(result.meta.remaining_attempts);
                    localStorage.setItem('remaining_predictions', result.meta.remaining_attempts);
                }

                showNotification('success', 'Assessment completed!');

                // Navigate to result page with public data
                console.log('Navigating to result page with:', {
                    result: predictionResult,
                    formData: submitData,
                    remainingAttempts: result.meta?.remaining_attempts
                });

                navigate('/prediction/result', {
                    state: {
                        result: predictionResult,
                        formData: submitData,
                        isPublic: true,
                        remainingAttempts: result.meta?.remaining_attempts
                    }
                });
            }
        } catch (error) {
            console.error('❌ Prediction error:', error);

            // Handle HTML response error
            if (error.isHtmlError || (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE'))) {
                showNotification('error', 'Server connection error. Please check if backend is running.');
                setErrors({
                    general: 'Cannot connect to server. Please make sure the backend server is running on http://localhost:8000'
                });
                return;
            }

            // Handle network errors
            if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
                showNotification('error', 'Network error. Please check your connection.');
                setErrors({ general: 'Cannot connect to server. Please try again.' });
                return;
            }

            // Handle 401 Unauthorized - session expired
            if (error.status === 401 || error.response?.status === 401) {
                showNotification('info', 'Please log in to complete your assessment');

                // Save form data and redirect to login
                navigate(ROUTES.LOGIN, {
                    state: {
                        from: ROUTES.PREDICTIONS.NEW,
                        assessmentData: formData,
                        message: 'Sign in to save your assessment results!'
                    }
                });
                return;
            }

            // Handle rate limiting (429)
            if (error.status === 429 || error.response?.status === 429) {
                setShowSignupPrompt(true);
                showNotification('warning', error.message || 'Too many attempts. Please try again later.');
                return;
            }

            // Handle validation errors from backend
            if (error.errors) {
                setErrors(error.errors);
                showNotification('error', 'Please check your inputs and try again');
                return;
            }

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                showNotification('error', 'Please check your inputs and try again');
                return;
            }

            // Handle 404 Not Found
            if (error.status === 404 || error.response?.status === 404) {
                showNotification('error', 'API endpoint not found. Check backend configuration.');
                setErrors({ general: 'Service unavailable. Please try again later.' });
                return;
            }

            // Handle general errors
            const errorMsg = error.userMessage ||
                error.message ||
                error.response?.data?.message ||
                'Prediction failed. Please try again.';

            setErrors({ general: errorMsg });
            showNotification('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getBMICategory = (bmi) => {
        if (!bmi) return null;
        const bmiNum = parseFloat(bmi);
        if (bmiNum < 18.5) return { category: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50' };
        if (bmiNum < 25) return { category: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
        if (bmiNum < 30) return { category: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        return { category: 'Obese', color: 'text-red-600', bg: 'bg-red-50' };
    };

    // Show loading while profile is being fetched for authenticated users
    if (user && profileLoading && !profileLoaded) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your profile data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Back to Home Link */}
                <Link
                    to={ROUTES.HOME}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Back to Home
                </Link>

                {/* Profile Data Notice */}
                {user && profile && profileLoaded && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-800">Profile Data Loaded</h4>
                                <p className="text-xs text-blue-700 mt-1">
                                    Your profile information has been pre-filled. You can update these values for this assessment only.
                                    {formData.age && ` Age: ${formData.age}, Height: ${formData.height}cm, Weight: ${formData.weight}kg`}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Public User Warning */}
                {!user && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                    >
                        <div className="flex items-start gap-3">
                            <SparklesIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-800">Free Prediction Mode</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    You have <span className="font-bold text-lg">{remainingPredictions}</span> free{' '}
                                    {remainingPredictions === 1 ? 'prediction' : 'predictions'} remaining.
                                </p>
                                <div className="mt-3 flex gap-3">
                                    <Link
                                        to={ROUTES.REGISTER}
                                        className="inline-flex items-center gap-1 text-sm bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                                    >
                                        Create Account
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to={ROUTES.LOGIN}
                                        className="inline-flex items-center gap-1 text-sm bg-white text-amber-700 px-4 py-2 rounded-lg border border-amber-300 hover:bg-amber-50 transition"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Saved Data Restored Message */}
                {location.state?.savedData && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-700">
                                Your form data has been restored. Please review and submit.
                            </p>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                        <h2 className="text-3xl font-bold text-white">Diabetes Risk Assessment</h2>
                        <p className="text-blue-100 mt-2">
                            Answer a few questions to assess your diabetes risk
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-8 pt-6">
                        <FormSteps steps={formSteps} currentStep={currentStep - 1} />
                    </div>

                    {/* Validation Errors Summary */}
                    {Object.keys(validationErrors).length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                            <div className="flex items-start gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800">Please fix the following errors:</h4>
                                    <ul className="mt-1 text-xs text-red-700 list-disc list-inside">
                                        {Object.values(validationErrors).map((error, idx) => (
                                            <li key={idx}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="px-8 py-6">
                        {/* Step 1: Demographics */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">1</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Demographic Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Age <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition
                                                ${validationErrors.age || errors.age ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="45"
                                            min="18"
                                            max="120"
                                        />
                                        {(validationErrors.age || errors.age) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.age || errors.age}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Gender <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition
                                                ${validationErrors.gender || errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                        {(validationErrors.gender || errors.gender) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.gender || errors.gender}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Education Level
                                        </label>
                                        <select
                                            name="education"
                                            value={formData.education}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                        >
                                            <option value="1">Never attended</option>
                                            <option value="2">Elementary</option>
                                            <option value="3">Some high school</option>
                                            <option value="4">High school graduate</option>
                                            <option value="5">Some college</option>
                                            <option value="6">College graduate</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Income Level
                                        </label>
                                        <select
                                            name="income"
                                            value={formData.income}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
                                        >
                                            <option value="1">Less than $10,000</option>
                                            <option value="2">$10,000 - $15,000</option>
                                            <option value="3">$15,000 - $20,000</option>
                                            <option value="4">$20,000 - $25,000</option>
                                            <option value="5">$25,000 - $35,000</option>
                                            <option value="6">$35,000 - $50,000</option>
                                            <option value="7">$50,000 - $75,000</option>
                                            <option value="8">More than $75,000</option>
                                        </select>
                                    </div>
                                </div>

                                {featureInfo && featureInfo.age_importance && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700 flex items-center gap-2">
                                            <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
                                            Age is one of the most important factors in diabetes risk prediction.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 2: Health Status */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">2</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Health Status</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        General Health <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="genHlth"
                                        value={formData.genHlth}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition
                                            ${validationErrors.genHlth || errors.genHlth ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="1">Excellent</option>
                                        <option value="2">Very Good</option>
                                        <option value="3">Good</option>
                                        <option value="4">Fair</option>
                                        <option value="5">Poor</option>
                                    </select>
                                    {(validationErrors.genHlth || errors.genHlth) && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {validationErrors.genHlth || errors.genHlth}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mental Health Days (past 30)
                                        </label>
                                        <input
                                            type="number"
                                            name="mentHlth"
                                            value={formData.mentHlth}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition
                                                ${validationErrors.mentHlth || errors.mentHlth ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="0-30"
                                            min="0"
                                            max="30"
                                        />
                                        {(validationErrors.mentHlth || errors.mentHlth) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.mentHlth || errors.mentHlth}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Physical Health Days (past 30)
                                        </label>
                                        <input
                                            type="number"
                                            name="physHlth"
                                            value={formData.physHlth}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition
                                                ${validationErrors.physHlth || errors.physHlth ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="0-30"
                                            min="0"
                                            max="30"
                                        />
                                        {(validationErrors.physHlth || errors.physHlth) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.physHlth || errors.physHlth}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-700">Chronic Conditions</h4>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="highBP"
                                            checked={formData.highBP}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">High Blood Pressure</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="highChol"
                                            checked={formData.highChol}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">High Cholesterol</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="stroke"
                                            checked={formData.stroke}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">History of Stroke</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="heartDisease"
                                            checked={formData.heartDisease}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Heart Disease or Attack</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Lifestyle */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">3</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Lifestyle & Physical Measurements</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Height (cm) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition
                                                ${validationErrors.height || errors.height ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="170"
                                            step="0.1"
                                            min="50"
                                            max="300"
                                        />
                                        {(validationErrors.height || errors.height) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.height || errors.height}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weight (kg) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition
                                                ${validationErrors.weight || errors.weight ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="70"
                                            step="0.1"
                                            min="20"
                                            max="500"
                                        />
                                        {(validationErrors.weight || errors.weight) && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.weight || errors.weight}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {formData.bmi && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`p-4 rounded-lg border ${getBMICategory(formData.bmi)?.bg || 'bg-gray-50'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-700">
                                                <span className="font-semibold">Your BMI:</span> {formData.bmi}
                                            </p>
                                            {getBMICategory(formData.bmi) && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBMICategory(formData.bmi)?.color} bg-white`}>
                                                    {getBMICategory(formData.bmi)?.category}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-700">Lifestyle Factors</h4>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="smoker"
                                            checked={formData.smoker}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Smoker (100+ cigarettes in lifetime)</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="heavyAlcohol"
                                            checked={formData.heavyAlcohol}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Heavy Alcohol Consumption</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="physActivity"
                                            checked={formData.physActivity}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Physical Activity (past 30 days)</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="fruits"
                                            checked={formData.fruits}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Eat Fruits (1+ times/day)</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="veggies"
                                            checked={formData.veggies}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Eat Vegetables (1+ times/day)</span>
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-700">Healthcare Access</h4>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="anyHealthcare"
                                            checked={formData.anyHealthcare}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Have Health Insurance</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="noDocCost"
                                            checked={formData.noDocCost}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Couldn't See Doctor Due to Cost</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="cholCheck"
                                            checked={formData.cholCheck}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Cholesterol Check (past 5 years)</span>
                                    </label>
                                </div>

                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="diffWalk"
                                        checked={formData.diffWalk}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Difficulty Walking</span>
                                </label>
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold">4</span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Review Your Information</h3>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                                    {/* Demographics Review */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                            <UserIcon className="w-4 h-4" />
                                            Demographics
                                        </h4>
                                        <dl className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <dt className="text-gray-500">Age:</dt>
                                                <dd className="font-medium">{formData.age || '—'} years</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-500">Gender:</dt>
                                                <dd className="font-medium capitalize">{formData.gender || '—'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-500">Education:</dt>
                                                <dd className="font-medium">
                                                    {formData.education === '1' ? 'Never attended' :
                                                        formData.education === '2' ? 'Elementary' :
                                                            formData.education === '3' ? 'Some high school' :
                                                                formData.education === '4' ? 'High school graduate' :
                                                                    formData.education === '5' ? 'Some college' :
                                                                        'College graduate'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-500">Income:</dt>
                                                <dd className="font-medium">
                                                    {formData.income === '1' ? '<$10k' :
                                                        formData.income === '2' ? '$10-15k' :
                                                            formData.income === '3' ? '$15-20k' :
                                                                formData.income === '4' ? '$20-25k' :
                                                                    formData.income === '5' ? '$25-35k' :
                                                                        formData.income === '6' ? '$35-50k' :
                                                                            formData.income === '7' ? '$50-75k' : '>$75k'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    {/* Health Status Review */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                            <HeartIcon className="w-4 h-4" />
                                            Health Status
                                        </h4>
                                        <dl className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <dt className="text-gray-500">General Health:</dt>
                                                <dd className="font-medium">
                                                    {['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'][formData.genHlth - 1]}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-500">Mental Health Days:</dt>
                                                <dd className="font-medium">{formData.mentHlth}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-500">Physical Health Days:</dt>
                                                <dd className="font-medium">{formData.physHlth}</dd>
                                            </div>
                                            <div className="col-span-2">
                                                <dt className="text-gray-500 mb-2">Chronic Conditions:</dt>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.highBP && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">High BP</span>}
                                                    {formData.highChol && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">High Chol</span>}
                                                    {formData.stroke && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Stroke</span>}
                                                    {formData.heartDisease && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Heart Disease</span>}
                                                    {!formData.highBP && !formData.highChol && !formData.stroke && !formData.heartDisease && (
                                                        <span className="text-gray-500">None reported</span>
                                                    )}
                                                </div>
                                            </div>
                                        </dl>
                                    </div>

                                    {/* Physical Measurements Review */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                                            <BeakerIcon className="w-4 h-4" />
                                            Physical Measurements
                                        </h4>
                                        <dl className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <dt className="text-gray-500">Height:</dt>
                                                <dd className="font-medium">{formData.height || '—'} cm</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-500">Weight:</dt>
                                                <dd className="font-medium">{formData.weight || '—'} kg</dd>
                                            </div>
                                            <div>
                                                <dt className="text-gray-500">BMI:</dt>
                                                <dd className={`font-medium ${getBMICategory(formData.bmi)?.color || ''}`}>
                                                    {formData.bmi || '—'} {formData.bmi && `(${getBMICategory(formData.bmi)?.category})`}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    {/* Lifestyle Review */}
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-3">Lifestyle Factors</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.smoker && <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">Smoker</span>}
                                            {formData.heavyAlcohol && <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">Heavy Alcohol</span>}
                                            {formData.physActivity && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Physically Active</span>}
                                            {formData.fruits && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Eats Fruits</span>}
                                            {formData.veggies && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Eats Vegetables</span>}
                                            {!formData.anyHealthcare && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">No Insurance</span>}
                                            {formData.diffWalk && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Difficulty Walking</span>}
                                            {!formData.smoker && !formData.heavyAlcohol && formData.physActivity && formData.fruits && formData.veggies && formData.anyHealthcare && !formData.diffWalk && (
                                                <span className="text-gray-500">Healthy lifestyle indicators</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Info Notice */}
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                    <p className="text-sm text-blue-700 flex items-start gap-2">
                                        <ShieldCheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Your responses will be used to calculate your diabetes risk using our AI model.
                                            {!user && ' Create an account to save these results and track your progress over time!'}
                                        </span>
                                    </p>
                                </div>

                                {/* Remaining attempts for guests */}
                                {!user && remainingPredictions > 0 && (
                                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
                                        <ClockIcon className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm text-amber-700">
                                            You have <strong>{remainingPredictions}</strong> free {remainingPredictions === 1 ? 'prediction' : 'predictions'} remaining
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* General Error */}
                        {errors.general && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200"
                            >
                                {errors.general}
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <ChevronLeftIcon className="w-5 h-5" />
                                    Back
                                </button>
                            )}

                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                                >
                                    Next
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="ml-auto flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {loading && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
                                    {loading ? 'Calculating...' : 'Get Risk Assessment'}
                                </button>
                            )}
                        </div>

                        {/* Step Hint */}
                        <p className="text-xs text-gray-400 text-center mt-4">
                            Step {currentStep} of 4: {formSteps[currentStep - 1].description}
                        </p>
                    </form>
                </motion.div>

                {/* Signup Prompt Modal */}
                <SignupPrompt
                    isOpen={showSignupPrompt}
                    onClose={() => setShowSignupPrompt(false)}
                    context="free_predictions"
                    remainingPredictions={remainingPredictions}
                />
            </div>
        </div>
    );
};

export default PredictionForm;