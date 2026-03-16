// src/components/FormSteps.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckIcon,
    BeakerIcon,
    HeartIcon,
    DocumentTextIcon,
    ChartBarIcon,
    UserIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const FormSteps = ({
    steps,
    currentStep,
    onStepClick,
    variant = 'default',
    size = 'default',
    showDescriptions = true,
    clickable = false,
    animated = true,
    className = '',
}) => {
    // Size configurations
    const sizes = {
        sm: {
            circle: 'w-8 h-8',
            icon: 'w-4 h-4',
            number: 'text-xs',
            label: 'text-xs',
            description: 'text-[10px]',
            container: 'py-2',
            progress: 'top-6',
        },
        default: {
            circle: 'w-10 h-10 md:w-12 md:h-12',
            icon: 'w-4 h-4 md:w-5 md:h-5',
            number: 'text-sm md:text-base',
            label: 'text-xs md:text-sm',
            description: 'text-[10px] md:text-xs',
            container: 'py-3 md:py-4',
            progress: 'top-7 md:top-8',
        },
        lg: {
            circle: 'w-12 h-12 md:w-14 md:h-14',
            icon: 'w-5 h-5 md:w-6 md:h-6',
            number: 'text-base md:text-lg',
            label: 'text-sm md:text-base',
            description: 'text-xs md:text-sm',
            container: 'py-4 md:py-6',
            progress: 'top-8 md:top-9',
        },
    };

    // Variant styles matching landing page
    const variants = {
        default: {
            completed: {
                bg: 'bg-primary-600',
                border: 'border-primary-600',
                text: 'text-white',
                ring: 'ring-4 ring-primary-100',
            },
            current: {
                bg: 'bg-white',
                border: 'border-primary-600',
                text: 'text-primary-600',
                ring: 'ring-4 ring-primary-100',
            },
            pending: {
                bg: 'bg-white',
                border: 'border-gray-300',
                text: 'text-gray-400',
                ring: '',
            },
            label: {
                completed: 'text-gray-900',
                current: 'text-gray-900',
                pending: 'text-gray-500',
            },
            description: 'text-gray-400',
            progress: 'bg-primary-600',
            progressBg: 'bg-gray-200',
        },
        gradient: {
            completed: {
                bg: 'bg-gradient-to-r from-primary-600 to-secondary-600',
                border: 'border-transparent',
                text: 'text-white',
                ring: 'ring-4 ring-primary-100',
            },
            current: {
                bg: 'bg-gradient-to-r from-primary-50 to-secondary-50',
                border: 'border-primary-600',
                text: 'text-primary-600',
                ring: 'ring-4 ring-primary-100',
            },
            pending: {
                bg: 'bg-white',
                border: 'border-gray-300',
                text: 'text-gray-400',
                ring: '',
            },
            label: {
                completed: 'text-gray-900',
                current: 'text-gray-900',
                pending: 'text-gray-500',
            },
            description: 'text-gray-400',
            progress: 'bg-gradient-to-r from-primary-600 to-secondary-600',
            progressBg: 'bg-gray-200',
        },
        minimal: {
            completed: {
                bg: 'bg-primary-100',
                border: 'border-primary-300',
                text: 'text-primary-700',
                ring: '',
            },
            current: {
                bg: 'bg-white',
                border: 'border-primary-500',
                text: 'text-primary-600',
                ring: '',
            },
            pending: {
                bg: 'bg-white',
                border: 'border-gray-200',
                text: 'text-gray-300',
                ring: '',
            },
            label: {
                completed: 'text-gray-700',
                current: 'text-gray-900',
                pending: 'text-gray-400',
            },
            description: 'text-gray-400',
            progress: 'bg-primary-500',
            progressBg: 'bg-gray-100',
        },
    };

    // Step icons mapping
    const stepIcons = {
        personal: UserIcon,
        health: HeartIcon,
        symptoms: DocumentTextIcon,
        results: ChartBarIcon,
        assessment: BeakerIcon,
        review: ClockIcon,
    };

    const currentSize = sizes[size] || sizes.default;
    const currentVariant = variants[variant] || variants.default;

    const getStepIcon = (step) => {
        if (step.icon) return step.icon;
        if (step.id && stepIcons[step.id]) return stepIcons[step.id];
        return null;
    };

    const handleStepClick = (index) => {
        if (clickable && onStepClick && index <= currentStep) {
            onStepClick(index);
        }
    };

    return (
        <div className={`relative ${currentSize.container} ${className}`}>
            {/* Progress Bar Background */}
            <div className={`absolute ${currentSize.progress} left-0 w-full h-1 rounded-full ${currentVariant.progressBg}`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className={`h-1 rounded-full ${currentVariant.progress}`}
                />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;

                    const stepState = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';
                    const Icon = getStepIcon(step);

                    return (
                        <div
                            key={step.id || index}
                            className="flex flex-col items-center"
                            onClick={() => handleStepClick(index)}
                        >
                            {/* Step Circle */}
                            <motion.div
                                whileHover={clickable && !isPending ? { scale: 1.05 } : {}}
                                whileTap={clickable && !isPending ? { scale: 0.95 } : {}}
                                className={`
                                    ${currentSize.circle}
                                    rounded-full flex items-center justify-center border-2
                                    transition-all duration-300
                                    ${currentVariant[stepState].bg}
                                    ${currentVariant[stepState].border}
                                    ${currentVariant[stepState].ring}
                                    ${clickable && !isPending ? 'cursor-pointer' : ''}
                                    relative
                                `}
                            >
                                {isCompleted ? (
                                    <CheckIcon className={`${currentSize.icon} ${currentVariant[stepState].text}`} />
                                ) : Icon ? (
                                    <Icon className={`${currentSize.icon} ${currentVariant[stepState].text}`} />
                                ) : (
                                    <span className={`font-semibold ${currentSize.number} ${currentVariant[stepState].text}`}>
                                        {index + 1}
                                    </span>
                                )}

                                {/* Pulse animation for current step */}
                                {isCurrent && animated && (
                                    <motion.span
                                        initial={{ scale: 1 }}
                                        animate={{ scale: 1.5, opacity: 0 }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: 'easeOut',
                                        }}
                                        className="absolute inset-0 rounded-full bg-primary-400"
                                    />
                                )}
                            </motion.div>

                            {/* Step Label */}
                            <div className="mt-2 md:mt-3 text-center max-w-[80px] md:max-w-[120px]">
                                <span
                                    className={`
                                        font-medium block
                                        ${currentSize.label}
                                        ${currentVariant.label[stepState]}
                                    `}
                                >
                                    {step.name}
                                </span>

                                {showDescriptions && step.description && (
                                    <span className={`${currentSize.description} ${currentVariant.description} hidden sm:block`}>
                                        {step.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Description */}
            {showDescriptions && steps[currentStep]?.description && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentStep}
                    className="mt-4 text-center sm:hidden"
                >
                    <p className="text-xs text-gray-500">
                        Step {currentStep + 1} of {steps.length}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                        {steps[currentStep].description}
                    </p>
                </motion.div>
            )}
        </div>
    );
};

// Pre-configured step sets for common forms

// Prediction form steps
export const PredictionFormSteps = ({ currentStep, onStepClick, clickable = false }) => {
    const steps = [
        {
            id: 'personal',
            name: 'Personal',
            description: 'Basic information',
            icon: UserIcon,
        },
        {
            id: 'health',
            name: 'Health',
            description: 'Health metrics',
            icon: HeartIcon,
        },
        {
            id: 'lifestyle',
            name: 'Lifestyle',
            description: 'Lifestyle factors',
            icon: BeakerIcon,
        },
        {
            id: 'results',
            name: 'Results',
            description: 'Your assessment',
            icon: ChartBarIcon,
        },
    ];

    return (
        <FormSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
            clickable={clickable}
            variant="gradient"
            size="default"
        />
    );
};

// Profile completion steps
export const ProfileSteps = ({ currentStep, onStepClick, clickable = false }) => {
    const steps = [
        {
            id: 'basic',
            name: 'Basic',
            description: 'Personal details',
            icon: UserIcon,
        },
        {
            id: 'contact',
            name: 'Contact',
            description: 'Contact info',
            icon: DocumentTextIcon,
        },
        {
            id: 'health',
            name: 'Health',
            description: 'Health data',
            icon: HeartIcon,
        },
        {
            id: 'review',
            name: 'Review',
            description: 'Review & save',
            icon: CheckIcon,
        },
    ];

    return (
        <FormSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
            clickable={clickable}
            variant="default"
            size="default"
        />
    );
};

// Medication setup steps
export const MedicationSteps = ({ currentStep, onStepClick, clickable = false }) => {
    const steps = [
        {
            id: 'details',
            name: 'Details',
            description: 'Medication info',
            icon: BeakerIcon,
        },
        {
            id: 'schedule',
            name: 'Schedule',
            description: 'When to take',
            icon: ClockIcon,
        },
        {
            id: 'reminders',
            name: 'Reminders',
            description: 'Set reminders',
            icon: DocumentTextIcon,
        },
        {
            id: 'confirm',
            name: 'Confirm',
            description: 'Review & save',
            icon: CheckIcon,
        },
    ];

    return (
        <FormSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
            clickable={clickable}
            variant="minimal"
            size="default"
        />
    );
};

// Symptom logging steps
export const SymptomSteps = ({ currentStep, onStepClick, clickable = false }) => {
    const steps = [
        {
            id: 'type',
            name: 'Type',
            description: 'Select symptom',
            icon: DocumentTextIcon,
        },
        {
            id: 'severity',
            name: 'Severity',
            description: 'Rate severity',
            icon: ChartBarIcon,
        },
        {
            id: 'details',
            name: 'Details',
            description: 'Additional info',
            icon: HeartIcon,
        },
        {
            id: 'save',
            name: 'Save',
            description: 'Save entry',
            icon: CheckIcon,
        },
    ];

    return (
        <FormSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
            clickable={clickable}
            variant="gradient"
            size="default"
        />
    );
};

// Onboarding steps
export const OnboardingSteps = ({ currentStep, onStepClick, clickable = false }) => {
    const steps = [
        {
            id: 'welcome',
            name: 'Welcome',
            description: 'Get started',
            icon: UserIcon,
        },
        {
            id: 'profile',
            name: 'Profile',
            description: 'Create profile',
            icon: HeartIcon,
        },
        {
            id: 'preferences',
            name: 'Preferences',
            description: 'Set preferences',
            icon: BeakerIcon,
        },
        {
            id: 'complete',
            name: 'Complete',
            description: 'Finish setup',
            icon: CheckIcon,
        },
    ];

    return (
        <FormSteps
            steps={steps}
            currentStep={currentStep}
            onStepClick={onStepClick}
            clickable={clickable}
            variant="gradient"
            size="lg"
        />
    );
};

export default FormSteps;