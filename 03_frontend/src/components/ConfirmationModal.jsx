import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
    const colors = {
        danger: {
            bg: 'bg-red-100',
            text: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700',
            icon: ExclamationTriangleIcon,
        },
        warning: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            icon: ExclamationTriangleIcon,
        },
        info: {
            bg: 'bg-blue-100',
            text: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700',
            icon: ExclamationTriangleIcon,
        },
    };

    const currentColor = colors[type] || colors.danger;
    const Icon = currentColor.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-xl shadow-soft max-w-md w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 ${currentColor.bg} rounded-full flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${currentColor.text}`} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-600 mb-6">{message}</p>

                            <div className="flex space-x-3">
                                <button
                                    onClick={onConfirm}
                                    className={`flex-1 ${currentColor.button} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                                >
                                    {confirmText}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 btn-secondary"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;