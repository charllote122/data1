// src/components/ConfirmationModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    XMarkIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    TrashIcon,
    BeakerIcon,
    HeartIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    size = 'md',
    icon = true,
    confirmButtonProps = {},
    cancelButtonProps = {},
    showCloseButton = true,
    backdropClose = true,
    isLoading = false,
}) => {
    // Color configurations matching landing page
    const colors = {
        danger: {
            bg: 'bg-red-50',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: ExclamationTriangleIcon,
        },
        warning: {
            bg: 'bg-yellow-50',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: ExclamationTriangleIcon,
        },
        info: {
            bg: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: InformationCircleIcon,
        },
        success: {
            bg: 'bg-green-50',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: CheckCircleIcon,
        },
        primary: {
            bg: 'bg-primary-50',
            iconBg: 'bg-primary-100',
            iconColor: 'text-primary-600',
            button: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
            border: 'border-primary-200',
            text: 'text-primary-800',
            icon: InformationCircleIcon,
        },
        delete: {
            bg: 'bg-red-50',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: TrashIcon,
        },
    };

    // Size configurations
    const sizes = {
        sm: {
            container: 'p-5',
            icon: 'w-10 h-10',
            iconInner: 'w-5 h-5',
            title: 'text-base',
            message: 'text-sm',
            button: 'py-2 text-sm',
        },
        md: {
            container: 'p-6',
            icon: 'w-12 h-12',
            iconInner: 'w-6 h-6',
            title: 'text-lg',
            message: 'text-sm',
            button: 'py-2.5 text-sm',
        },
        lg: {
            container: 'p-8',
            icon: 'w-14 h-14',
            iconInner: 'w-7 h-7',
            title: 'text-xl',
            message: 'text-base',
            button: 'py-3 text-base',
        },
    };

    const currentColor = colors[type] || colors.danger;
    const Icon = currentColor.icon;
    const currentSize = sizes[size] || sizes.md;

    const handleBackdropClick = (e) => {
        if (backdropClose && e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = async () => {
        if (isLoading) return;
        await onConfirm();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
                        onClick={handleBackdropClick}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`
                                bg-white rounded-2xl shadow-2xl
                                border ${currentColor.border}
                                max-w-md w-full
                                ${currentSize.container}
                                relative
                            `}
                        >
                            {/* Close button */}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    aria-label="Close"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            )}

                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                {icon && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1, type: 'spring' }}
                                        className={`
                                            ${currentSize.icon}
                                            ${currentColor.iconBg}
                                            rounded-full flex items-center justify-center mb-4
                                        `}
                                    >
                                        <Icon className={`${currentSize.iconInner} ${currentColor.iconColor}`} />
                                    </motion.div>
                                )}

                                {/* Title */}
                                <h3 className={`font-semibold text-gray-900 mb-2 ${currentSize.title}`}>
                                    {title}
                                </h3>

                                {/* Message */}
                                <p className={`text-gray-600 mb-6 ${currentSize.message}`}>
                                    {message}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex w-full gap-3">
                                    {/* Cancel Button */}
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className={`
                                            flex-1 px-4
                                            border border-gray-300
                                            text-gray-700 font-medium
                                            rounded-lg hover:bg-gray-50
                                            transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            ${currentSize.button}
                                            ${cancelButtonProps.className || ''}
                                        `}
                                        {...cancelButtonProps}
                                    >
                                        {cancelText}
                                    </button>

                                    {/* Confirm Button */}
                                    <button
                                        onClick={handleConfirm}
                                        disabled={isLoading}
                                        className={`
                                            flex-1 px-4
                                            ${currentColor.button}
                                            text-white font-medium
                                            rounded-lg transition-colors
                                            focus:outline-none focus:ring-2 focus:ring-offset-2
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            flex items-center justify-center gap-2
                                            ${currentSize.button}
                                            ${confirmButtonProps.className || ''}
                                        `}
                                        {...confirmButtonProps}
                                    >
                                        {isLoading ? (
                                            <>
                                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            confirmText
                                        )}
                                    </button>
                                </div>

                                {/* Tip for dangerous actions */}
                                {type === 'delete' && (
                                    <p className="text-xs text-gray-400 mt-4">
                                        This action cannot be undone
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

// Pre-configured confirmation modals for common use cases

// Delete confirmation modal
export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName = 'item', isLoading }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type="delete"
            title="Delete Confirmation"
            message={`Are you sure you want to delete this ${itemName}? This action cannot be undone.`}
            confirmText="Delete"
            icon={true}
            isLoading={isLoading}
        />
    );
};

// Account deletion modal (more prominent warning)
export const AccountDeleteModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type="danger"
            size="lg"
            title="Delete Account"
            message="This will permanently delete your account and all associated data. This action cannot be undone."
            confirmText="Yes, Delete My Account"
            cancelText="Cancel"
            isLoading={isLoading}
        />
    );
};

// Success confirmation modal
export const SuccessConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type="success"
            title={title || 'Success'}
            message={message || 'Operation completed successfully!'}
            confirmText="Continue"
            cancelText="Close"
        />
    );
};

// Info/Warning modal
export const InfoModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onClose}
            type={type}
            title={title}
            message={message}
            confirmText="Got it"
            showCloseButton={true}
            icon={true}
        />
    );
};

// Medication reminder confirmation
export const MedicationConfirmModal = ({ isOpen, onClose, onConfirm, medicationName, isLoading }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type="primary"
            title="Take Medication"
            message={`Have you taken ${medicationName}?`}
            confirmText="Yes, I've taken it"
            cancelText="Not yet"
            icon={HeartIcon}
            isLoading={isLoading}
        />
    );
};

// Prediction submission confirmation
export const PredictionConfirmModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type="primary"
            title="Submit Assessment"
            message="Are you ready to submit your health data for analysis? You'll receive your risk assessment immediately."
            confirmText="Submit"
            cancelText="Review"
            icon={BeakerIcon}
            isLoading={isLoading}
        />
    );
};

// Save changes confirmation
export const SaveChangesModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            type="info"
            title="Save Changes"
            message="You have unsaved changes. Do you want to save them before leaving?"
            confirmText="Save"
            cancelText="Discard"
            icon={CheckCircleIcon}
            isLoading={isLoading}
        />
    );
};

export default ConfirmationModal;