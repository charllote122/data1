// src/components/SignupPrompt.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const SignupPrompt = ({ isOpen, onClose, context, remainingPredictions }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                {context === 'free_predictions' ? (
                                    <span className="text-2xl font-bold text-blue-600">{remainingPredictions}</span>
                                ) : (
                                    <span className="text-2xl font-bold text-blue-600">✨</span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {context === 'free_predictions'
                                    ? 'Free Predictions Used!'
                                    : 'Unlock Premium Features'}
                            </h3>

                            <p className="text-gray-600 mb-6">
                                {context === 'free_predictions'
                                    ? `You've used all ${remainingPredictions} free predictions. Sign up for unlimited access!`
                                    : 'Create a free account to access all premium features and track your health journey.'}
                            </p>

                            <div className="space-y-3">
                                <Link
                                    to={ROUTES.REGISTER}
                                    className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                                    onClick={onClose}
                                >
                                    Sign Up Free
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="block w-full text-gray-600 py-2 hover:text-gray-800 transition"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default SignupPrompt;