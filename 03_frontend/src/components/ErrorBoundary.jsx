// src/components/ErrorBoundary.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    ArrowPathIcon,
    HomeIcon,
    BugAntIcon,
    HeartIcon,
    BeakerIcon
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCode: null,
            timestamp: new Date().toISOString()
        };
    }

    static getDerivedStateFromError(error) {
        // Generate a simple error code for tracking
        const errorCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
            hasError: true,
            errorCode
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to your error tracking service (e.g., Sentry)
        console.error('🚨 Error caught by boundary:', {
            error: error,
            errorInfo: errorInfo,
            errorCode: this.state.errorCode,
            timestamp: this.state.timestamp,
            url: window.location.href,
            userAgent: navigator.userAgent
        });

        // You could send this to your backend here
        // this.logErrorToServer(error, errorInfo, this.state.errorCode);
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleGoBack = () => {
        window.history.back();
    };

    render() {
        const { hasError, error, errorInfo, errorCode } = this.state;
        const { fallback, children } = this.props;

        if (hasError) {
            // Custom fallback if provided
            if (fallback) {
                return fallback;
            }

            // Default error UI matching landing page design
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl w-full"
                    >
                        {/* Error Card */}
                        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                            {/* Header with gradient */}
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-8 border-b border-gray-100">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                    Oops! Something Went Wrong
                                </h1>
                                <p className="text-gray-600 text-center max-w-md mx-auto">
                                    We encountered an unexpected error. Our team has been notified and is working on a fix.
                                </p>
                            </div>

                            {/* Error Details */}
                            <div className="p-6">
                                {/* Error Code */}
                                {errorCode && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">Error Code</p>
                                        <p className="text-lg font-mono font-semibold text-gray-900">
                                            ERR-{errorCode}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={this.handleRefresh}
                                        className="flex items-center justify-center gap-2 p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                        <span>Refresh</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={this.handleGoHome}
                                        className="flex items-center justify-center gap-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <HomeIcon className="w-5 h-5" />
                                        <span>Go Home</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={this.handleGoBack}
                                        className="flex items-center justify-center gap-2 p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span>Go Back</span>
                                    </motion.button>
                                </div>

                                {/* Support Information */}
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                        <HeartIcon className="w-5 h-5" />
                                        Need Help?
                                    </h3>
                                    <p className="text-sm text-blue-700 mb-3">
                                        If the problem persists, please contact our support team with the error code above.
                                    </p>
                                    <div className="flex gap-3">
                                        <a
                                            href="mailto:support@diabetespredictor.com"
                                            className="text-sm bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2 border border-blue-200"
                                        >
                                            <span>Contact Support</span>
                                        </a>
                                        <a
                                            href="/faq"
                                            className="text-sm text-blue-700 px-4 py-2 hover:underline"
                                        >
                                            Visit FAQ
                                        </a>
                                    </div>
                                </div>

                                {/* Development Details (only in development) */}
                                {process.env.NODE_ENV === 'development' && error && (
                                    <div className="mt-6">
                                        <details className="group">
                                            <summary className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                                                <BugAntIcon className="w-4 h-4" />
                                                <span>Error Details (Development Only)</span>
                                            </summary>
                                            <div className="mt-4 p-4 bg-gray-900 rounded-lg overflow-auto max-h-96">
                                                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                                                    {error.toString()}
                                                    {'\n\n'}
                                                    {errorInfo?.componentStack}
                                                </pre>
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer with app branding */}
                        <div className="mt-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <BeakerIcon className="w-4 h-4" />
                                <span className="text-sm">Diabetes Predictor • Making health management easier</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return children;
    }
}

// Pre-configured error boundaries for different sections
export const DashboardErrorBoundary = ({ children }) => (
    <ErrorBoundary
        fallback={
            <div className="p-6 bg-white rounded-xl border border-red-200">
                <div className="flex items-start gap-3">
                    <div className="bg-red-100 rounded-lg p-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">Dashboard Error</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Unable to load dashboard data. Please try refreshing.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        }
    >
        {children}
    </ErrorBoundary>
);

export const PredictionErrorBoundary = ({ children }) => (
    <ErrorBoundary
        fallback={
            <div className="text-center py-12">
                <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Prediction Error</h3>
                <p className="text-gray-600 mb-4">Failed to process your request. Please try again.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-primary"
                >
                    Try Again
                </button>
            </div>
        }
    >
        {children}
    </ErrorBoundary>
);

export const AuthErrorBoundary = ({ children }) => (
    <ErrorBoundary
        fallback={
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md text-center">
                    <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
                    <p className="text-gray-600 mb-6">
                        There was a problem with your authentication. Please log in again.
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="btn-primary"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        }
    >
        {children}
    </ErrorBoundary>
);

export default ErrorBoundary;