// src/components/LoadingSpinner.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BeakerIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({
    size = 'default',
    fullScreen = true,
    variant = 'spinner',
    text = 'Loading...',
    showText = true,
    className = ''
}) => {
    const sizes = {
        sm: {
            container: 'w-16 h-16',
            spinner: 'w-6 h-6 border-2',
            icon: 'w-6 h-6',
            text: 'text-xs',
        },
        default: {
            container: 'w-24 h-24',
            spinner: 'w-10 h-10 border-3',
            icon: 'w-10 h-10',
            text: 'text-sm',
        },
        lg: {
            container: 'w-32 h-32',
            spinner: 'w-14 h-14 border-4',
            icon: 'w-14 h-14',
            text: 'text-base',
        },
        xl: {
            container: 'w-40 h-40',
            spinner: 'w-20 h-20 border-4',
            icon: 'w-20 h-20',
            text: 'text-lg',
        },
    };

    const spinnerVariants = {
        animate: {
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const bounceVariants = {
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const dotsVariants = {
        animate: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const dotVariants = {
        initial: { y: 0 },
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 0.6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const SpinnerContent = () => {
        const currentSize = sizes[size] || sizes.default;

        const renderSpinner = () => {
            switch (variant) {
                case 'spinner':
                    return (
                        <motion.div
                            variants={spinnerVariants}
                            animate="animate"
                            className={`${currentSize.spinner} border-t-primary-600 border-primary-200 rounded-full`}
                        />
                    );

                case 'pulse':
                    return (
                        <motion.div
                            variants={pulseVariants}
                            animate="animate"
                            className={`${currentSize.container} bg-primary-100 rounded-full flex items-center justify-center`}
                        >
                            <BeakerIcon className={`${currentSize.icon} text-primary-600`} />
                        </motion.div>
                    );

                case 'bounce':
                    return (
                        <motion.div
                            variants={bounceVariants}
                            animate="animate"
                            className={`${currentSize.container} flex items-center justify-center`}
                        >
                            <HeartIcon className={`${currentSize.icon} text-primary-600`} />
                        </motion.div>
                    );

                case 'dots':
                    return (
                        <motion.div
                            variants={dotsVariants}
                            initial="initial"
                            animate="animate"
                            className="flex space-x-2"
                        >
                            {[1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    variants={dotVariants}
                                    className="w-3 h-3 bg-primary-600 rounded-full"
                                />
                            ))}
                        </motion.div>
                    );

                case 'logo':
                    return (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="relative"
                        >
                            <BeakerIcon className={`${currentSize.icon} text-primary-200`} />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <div className="w-2 h-2 bg-primary-600 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2" />
                            </motion.div>
                        </motion.div>
                    );

                case 'sparkle':
                    return (
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <SparklesIcon className={`${currentSize.icon} text-primary-600`} />
                        </motion.div>
                    );

                default:
                    return (
                        <motion.div
                            variants={spinnerVariants}
                            animate="animate"
                            className={`${currentSize.spinner} border-t-primary-600 border-primary-200 rounded-full`}
                        />
                    );
            }
        };

        return (
            <div className={`flex flex-col items-center justify-center ${className}`}>
                {renderSpinner()}
                {showText && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`mt-4 ${currentSize.text} text-gray-500 font-medium`}
                    >
                        {text}
                    </motion.p>
                )}
            </div>
        );
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <SpinnerContent />
            </div>
        );
    }

    return <SpinnerContent />;
};

// Pre-configured spinners for common use cases
export const PageSpinner = ({ text = 'Loading page...' }) => (
    <LoadingSpinner size="lg" fullScreen={true} text={text} variant="spinner" />
);

export const ButtonSpinner = ({ size = 'sm' }) => (
    <LoadingSpinner size={size} fullScreen={false} showText={false} variant="spinner" />
);

export const ContentSpinner = ({ text = 'Loading content...' }) => (
    <LoadingSpinner size="default" fullScreen={false} variant="pulse" text={text} />
);

export const HealthSpinner = ({ text = 'Analyzing health data...' }) => (
    <LoadingSpinner size="lg" fullScreen={false} variant="logo" text={text} />
);

export const PredictionSpinner = ({ text = 'Calculating your risk...' }) => (
    <LoadingSpinner size="lg" fullScreen={false} variant="bounce" text={text} />
);

// Skeleton loaders for content
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            {lines > 3 && (
                <>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                </>
            )}
        </div>
    );
};

export const CardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </div>
        </div>
        <SkeletonLoader lines={2} />
    </div>
);

export const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
        ))}
    </div>
);

export const TableRowSkeleton = ({ columns = 4 }) => (
    <div className="border-b border-gray-100 py-4">
        <div className="flex gap-4">
            {Array(columns).fill(0).map((_, i) => (
                <div key={i} className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
        </div>
    </div>
);

// Simple spinner for backward compatibility
export const SimpleSpinner = ({ className = '' }) => (
    <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
);

export default LoadingSpinner;