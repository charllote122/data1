// src/pages/prediction/NewPrediction.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    BeakerIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    UserIcon,
    HeartIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import FormSteps from './components/FormSteps';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ROUTES } from '../../constants/routes';
import toast from 'react-hot-toast';

const steps = [
    { id: 'demographics', name: 'Demographics', description: 'Basic information' },
    { id: 'conditions', name: 'Health Conditions', description: 'Medical history' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Daily habits' },
    { id: 'health', name: 'Health Status', description: 'Current health' },
];

const schema = yup.object({
    // Demographics
    age: yup
        .number()
        .required('Age is required')
        .min(18, 'Must be at least 18')
        .max(120, 'Invalid age')
        .typeError('Age must be a number'),
    sex: yup
        .number()
        .required('Sex is required')
        .oneOf([0, 1], 'Invalid selection'),
    bmi: yup
        .number()
        .required('BMI is required')
        .min(10, 'BMI must be between 10 and 60')
        .max(60, 'BMI must be between 10 and 60')
        .typeError('BMI must be a number'),

    // Health Conditions
    highBP: yup.boolean(),
    highChol: yup.boolean(),
    stroke: yup.boolean(),
    heartDisease: yup.boolean(),

    // Lifestyle
    physActivity: yup.boolean(),
    fruits: yup.boolean(),
    veggies: yup.boolean(),
    smoker: yup.boolean(),
    heavyAlcohol: yup.boolean(),

    // Health Status
    genHealth: yup
        .number()
        .required('General health is required')
        .min(1)
        .max(5)
        .typeError('General health is required'),
    physHealthDays: yup
        .number()
        .required('Required')
        .min(0, 'Must be between 0 and 30')
        .max(30, 'Must be between 0 and 30')
        .typeError('Must be a number'),
    mentalHealthDays: yup
        .number()
        .min(0, 'Must be between 0 and 30')
        .max(30, 'Must be between 0 and 30')
        .typeError('Must be a number'),
    diffWalk: yup.boolean(),
});

const NewPrediction = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(3);

    const { register, handleSubmit, formState: { errors, isValid }, trigger, watch } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
        defaultValues: {
            age: 45,
            sex: 1,
            bmi: 25,
            highBP: false,
            highChol: false,
            stroke: false,
            heartDisease: false,
            physActivity: true,
            fruits: true,
            veggies: true,
            smoker: false,
            heavyAlcohol: false,
            genHealth: 3,
            physHealthDays: 0,
            mentalHealthDays: 0,
            diffWalk: false,
        },
    });

    const formData = watch();

    const nextStep = async () => {
        const fieldsToValidate = getFieldsForStep(currentStep);
        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            showNotification('error', 'Please fill in all required fields correctly');
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getFieldsForStep = (step) => {
        switch (step) {
            case 0:
                return ['age', 'sex', 'bmi'];
            case 1:
                return ['highBP', 'highChol', 'stroke', 'heartDisease'];
            case 2:
                return ['physActivity', 'fruits', 'veggies', 'smoker', 'heavyAlcohol'];
            case 3:
                return ['genHealth', 'physHealthDays', 'mentalHealthDays', 'diffWalk'];
            default:
                return [];
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // Format data to match backend expectations
            const formattedData = {
                Age: Number(data.age),
                Sex: Number(data.sex),
                BMI: Number(data.bmi),
                HighBP: data.highBP ? 1 : 0,
                HighChol: data.highChol ? 1 : 0,
                Stroke: data.stroke ? 1 : 0,
                HeartDiseaseorAttack: data.heartDisease ? 1 : 0,
                PhysActivity: data.physActivity ? 1 : 0,
                Fruits: data.fruits ? 1 : 0,
                Veggies: data.veggies ? 1 : 0,
                Smoker: data.smoker ? 1 : 0,
                HvyAlcoholConsump: data.heavyAlcohol ? 1 : 0,
                GenHlth: Number(data.genHealth),
                PhysHlth: Number(data.physHealthDays),
                MentHlth: Number(data.mentalHealthDays || 0),
                DiffWalk: data.diffWalk ? 1 : 0,
                // Add default values for required fields not in form
                AnyHealthcare: 1,
                NoDocbcCost: 0,
                CholCheck: 1,
                Education: 4,
                Income: 5
            };

            console.log('📤 Submitting prediction:', formattedData);

            // Try public prediction first (unauthenticated)
            const response = await api.publicPredict(formattedData);

            console.log('📥 Prediction response:', response);

            const predictionResult = response.prediction || response;

            // Update remaining attempts if provided
            if (response.meta?.remaining_attempts !== undefined) {
                setRemainingAttempts(response.meta.remaining_attempts);
                localStorage.setItem('remaining_predictions', response.meta.remaining_attempts);
            }

            showNotification('success', 'Assessment completed successfully!');

            // Navigate to results page with data
            navigate(ROUTES.PREDICTIONS.RESULT, {
                state: {
                    result: predictionResult,
                    formData: formattedData,
                    isPublic: true,
                    remainingAttempts: response.meta?.remaining_attempts
                }
            });

        } catch (error) {
            console.error('❌ Prediction error:', error);

            if (error.status === 400) {
                showNotification('error', 'Please check your input values');
            } else if (error.status === 429) {
                showNotification('error', 'Too many attempts. Please try again later.');
            } else {
                showNotification('error', error.message || 'Prediction failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">New Risk Assessment</h1>
                        <p className="text-gray-600 mt-2">
                            Complete the form below to get your personalized diabetes risk assessment
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                        <SparklesIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-700">
                            Free attempts: <span className="font-bold">{remainingAttempts}</span>
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Progress Steps */}
            <FormSteps steps={steps} currentStep={currentStep} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white">
                        {steps[currentStep].name}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                        {steps[currentStep].description}
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Demographics */}
                        {currentStep === 0 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Age <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            {...register('age')}
                                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition
                                                ${errors.age ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                                            placeholder="Enter age"
                                        />
                                        {errors.age && (
                                            <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sex <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            {...register('sex')}
                                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition
                                                ${errors.sex ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                                        >
                                            <option value={1}>Male</option>
                                            <option value={0}>Female</option>
                                        </select>
                                        {errors.sex && (
                                            <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        BMI (Body Mass Index) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register('bmi')}
                                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition
                                            ${errors.bmi ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                                        placeholder="Enter BMI"
                                    />
                                    {errors.bmi && (
                                        <p className="mt-1 text-sm text-red-600">{errors.bmi.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        BMI = weight(kg) / height(m)²
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Health Conditions */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('highBP')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">High Blood Pressure</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('highChol')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">High Cholesterol</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('stroke')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Had a Stroke</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('heartDisease')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Heart Disease or Attack</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Lifestyle */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('physActivity')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Physical Activity</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('fruits')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Eat Fruits Daily</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('veggies')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Eat Vegetables Daily</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                        <input
                                            type="checkbox"
                                            {...register('smoker')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Smoker</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200 md:col-span-2">
                                        <input
                                            type="checkbox"
                                            {...register('heavyAlcohol')}
                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Heavy Alcohol Consumption</span>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Health Status */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        General Health <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('genHealth')}
                                        className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition
                                            ${errors.genHealth ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                                    >
                                        <option value={1}>Excellent</option>
                                        <option value={2}>Very Good</option>
                                        <option value={3}>Good</option>
                                        <option value={4}>Fair</option>
                                        <option value={5}>Poor</option>
                                    </select>
                                    {errors.genHealth && (
                                        <p className="mt-1 text-sm text-red-600">{errors.genHealth.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Physical Health Days (last 30) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            {...register('physHealthDays')}
                                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition
                                                ${errors.physHealthDays ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                                            placeholder="0-30 days"
                                            min="0"
                                            max="30"
                                        />
                                        {errors.physHealthDays && (
                                            <p className="mt-1 text-sm text-red-600">{errors.physHealthDays.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mental Health Days (last 30)
                                        </label>
                                        <input
                                            type="number"
                                            {...register('mentalHealthDays')}
                                            className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition
                                                ${errors.mentalHealthDays ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500'}`}
                                            placeholder="0-30 days"
                                            min="0"
                                            max="30"
                                        />
                                        {errors.mentalHealthDays && (
                                            <p className="mt-1 text-sm text-red-600">{errors.mentalHealthDays.message}</p>
                                        )}
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                    <input
                                        type="checkbox"
                                        {...register('diffWalk')}
                                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 font-medium">Difficulty Walking</span>
                                </label>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Previous
                        </button>

                        {currentStep < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                            >
                                Next
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || !isValid}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="w-4 h-4" />
                                        <span>Submit Assessment</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>

            {/* Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
            >
                <div className="flex items-center gap-2 mb-3">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Input Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500">Age</p>
                        <p className="font-medium text-gray-900">{formData.age || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">BMI</p>
                        <p className="font-medium text-gray-900">{formData.bmi || '-'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">General Health</p>
                        <p className="font-medium text-gray-900">
                            {formData.genHealth ? ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'][formData.genHealth - 1] : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500">Risk Factors</p>
                        <p className="font-medium text-gray-900">
                            {[
                                formData.highBP && 'High BP',
                                formData.highChol && 'High Chol',
                                formData.smoker && 'Smoker',
                            ].filter(Boolean).length || 0} factors
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NewPrediction;