// src/components/EmptyState.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BeakerIcon,
    HeartIcon,
    DocumentTextIcon,
    ClockIcon,
    SparklesIcon,
    PlusCircleIcon,
    ArrowRightIcon,
    ChartBarIcon,
    CalendarIcon,
    UserIcon,
    ShieldCheckIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const EmptyState = ({
    title = 'No data found',
    message = 'Get started by creating your first item.',
    icon: Icon = DocumentTextIcon,
    actionText = 'Create New',
    actionLink = '#',
    onAction,
    secondaryActionText,
    secondaryActionLink,
    onSecondaryAction,
    variant = 'default', // 'default', 'compact', 'centered'
    className = '',
    showIcon = true,
    showAction = true,
    children
}) => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    // Icon color mapping
    const getIconColor = () => {
        switch (variant) {
            case 'compact':
                return 'text-gray-400';
            default:
                return 'text-primary-500';
        }
    };

    // Background color mapping
    const getIconBackground = () => {
        switch (variant) {
            case 'compact':
                return 'bg-gray-50';
            default:
                return 'bg-primary-50';
        }
    };

    const iconColor = getIconColor();
    const iconBg = getIconBackground();

    // Render based on variant
    if (variant === 'compact') {
        return (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`flex flex-col items-center justify-center py-8 px-4 ${className}`}
            >
                {showIcon && Icon && (
                    <motion.div
                        variants={itemVariants}
                        className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mb-3`}
                    >
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </motion.div>
                )}
                <motion.h3 variants={itemVariants} className="text-sm font-medium text-gray-900 mb-1">
                    {title}
                </motion.h3>
                <motion.p variants={itemVariants} className="text-xs text-gray-500 text-center mb-3">
                    {message}
                </motion.p>
                {showAction && (
                    <motion.div variants={itemVariants}>
                        {onAction ? (
                            <button
                                onClick={onAction}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                {actionText}
                                <ArrowRightIcon className="w-3 h-3" />
                            </button>
                        ) : (
                            <Link
                                to={actionLink}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                {actionText}
                                <ArrowRightIcon className="w-3 h-3" />
                            </Link>
                        )}
                    </motion.div>
                )}
                {children}
            </motion.div>
        );
    }

    // Centered variant (default for full page empty states)
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
        >
            {showIcon && Icon && (
                <motion.div
                    variants={itemVariants}
                    className={`w-20 h-20 ${iconBg} rounded-2xl flex items-center justify-center mb-6`}
                >
                    <Icon className={`w-10 h-10 ${iconColor}`} />
                </motion.div>
            )}
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </motion.h3>
            <motion.p variants={itemVariants} className="text-sm text-gray-500 max-w-sm mb-8">
                {message}
            </motion.p>
            {showAction && (
                <motion.div variants={itemVariants} className="flex gap-3">
                    {onAction ? (
                        <button
                            onClick={onAction}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            {actionText}
                        </button>
                    ) : (
                        <Link
                            to={actionLink}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm"
                        >
                            <PlusCircleIcon className="w-5 h-5" />
                            {actionText}
                        </Link>
                    )}
                    {secondaryActionText && (
                        secondaryActionLink ? (
                            <Link
                                to={secondaryActionLink}
                                onClick={onSecondaryAction}
                                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                {secondaryActionText}
                            </Link>
                        ) : onSecondaryAction && (
                            <button
                                onClick={onSecondaryAction}
                                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                {secondaryActionText}
                            </button>
                        )
                    )}
                </motion.div>
            )}
            {children}
        </motion.div>
    );
};

// Pre-configured empty states for common use cases
export const EmptyPredictions = ({ onAction, message, ...props }) => (
    <EmptyState
        icon={BeakerIcon}
        title="No assessments yet"
        message={message || "You haven't created any risk assessments. Start your first assessment to see your results."}
        actionText="Start Assessment"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptySymptoms = ({ onAction, ...props }) => (
    <EmptyState
        icon={HeartIcon}
        title="No symptoms logged"
        message="Track your symptoms to identify patterns and share with your healthcare provider."
        actionText="Log Symptom"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptyMedications = ({ onAction, ...props }) => (
    <EmptyState
        icon={DocumentTextIcon}
        title="No medications added"
        message="Add your medications to set reminders and track adherence."
        actionText="Add Medication"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptyHistory = ({ onAction, ...props }) => (
    <EmptyState
        icon={ClockIcon}
        title="No history yet"
        message="Your past assessments and activities will appear here."
        actionText="Create Assessment"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptyGoals = ({ onAction, ...props }) => (
    <EmptyState
        icon={ChartBarIcon}
        title="No goals set"
        message="Set health goals to track your progress and stay motivated."
        actionText="Create Goal"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptyChallenges = ({ onAction, ...props }) => (
    <EmptyState
        icon={SparklesIcon}
        title="No challenges joined"
        message="Join challenges to compete with others and stay motivated."
        actionText="Browse Challenges"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptyProfile = ({ onAction, ...props }) => (
    <EmptyState
        icon={UserIcon}
        title="Profile incomplete"
        message="Complete your health profile to get personalized insights."
        actionText="Complete Profile"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptyCalendar = ({ onAction, ...props }) => (
    <EmptyState
        icon={CalendarIcon}
        title="No events scheduled"
        message="Your medication schedule and appointments will appear here."
        actionText="Add Medication"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

export const EmptyResources = ({ onAction, ...props }) => (
    <EmptyState
        icon={InformationCircleIcon}
        title="No resources found"
        message="Check back later for health tips and educational content."
        actionText="Refresh"
        onAction={onAction}
        variant="centered"
        {...props}
    />
);

// Compact versions for smaller spaces
export const CompactEmptyState = ({ title, message, icon: Icon = DocumentTextIcon, onAction, actionText = 'Add', ...props }) => (
    <EmptyState
        icon={Icon}
        title={title}
        message={message}
        actionText={actionText}
        onAction={onAction}
        variant="compact"
        showIcon={true}
        showAction={!!onAction}
        {...props}
    />
);

export default EmptyState;