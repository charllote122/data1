// src/components/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
    BeakerIcon,
    HeartIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

const Card = ({
    children,
    className = '',
    hover = true,
    padding = true,
    variant = 'default',
    interactive = false,
    onClick,
    featured = false,
    gradient = false,
    border = true,
    shadow = 'soft',
    animation = 'fade',
}) => {
    // Variants matching landing page design
    const variants = {
        default: {
            bg: 'bg-white',
            border: 'border-gray-100',
            shadow: 'shadow-soft',
        },
        primary: {
            bg: 'bg-primary-50',
            border: 'border-primary-200',
            shadow: 'shadow-primary-soft',
        },
        gradient: {
            bg: 'bg-gradient-to-br from-primary-50 to-secondary-50',
            border: 'border-primary-100',
            shadow: 'shadow-soft',
        },
        stats: {
            bg: 'bg-white',
            border: 'border-gray-100',
            shadow: 'shadow-soft',
        },
        feature: {
            bg: 'bg-white',
            border: 'border-gray-100',
            shadow: 'shadow-soft hover:shadow-lg',
        },
        result: {
            bg: 'bg-gradient-to-br from-primary-500 to-primary-600',
            border: 'border-primary-400',
            shadow: 'shadow-lg shadow-primary-500/30',
            text: 'text-white',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            shadow: 'shadow-soft',
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            shadow: 'shadow-soft',
        },
    };

    // Shadow sizes matching landing page
    const shadows = {
        none: '',
        soft: 'shadow-soft',
        medium: 'shadow-md',
        large: 'shadow-lg',
        xl: 'shadow-xl',
        primary: 'shadow-lg shadow-primary-500/30',
    };

    // Border radius options
    const radius = {
        none: 'rounded-none',
        sm: 'rounded-lg',
        md: 'rounded-xl',
        lg: 'rounded-2xl',
        full: 'rounded-3xl',
    };

    // ✅ FIXED: Added 'const' declaration
    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    };

    // Animation variants
    const animations = {
        fade: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5 },
        },
        scale: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.4 },
        },
        slide: {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            transition: { duration: 0.5 },
        },
        none: {},
    };

    const currentVariant = variants[variant] || variants.default;
    const currentShadow = shadows[shadow] || shadows.soft;
    const currentAnimation = animations[animation] || animations.fade;

    // Hover effects
    const hoverClasses = hover
        ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-200'
        : '';

    // Interactive styles (clickable cards)
    const interactiveClasses = interactive || onClick
        ? 'cursor-pointer active:scale-[0.98] transition-transform'
        : '';

    // Featured card (prominent)
    const featuredClasses = featured
        ? 'ring-2 ring-primary-500 ring-offset-2'
        : '';

    // Determine padding value - handle boolean padding
    const getPaddingClass = () => {
        if (padding === false) return paddings.none;
        if (typeof padding === 'string') return paddings[padding] || paddings.md;
        return paddings.md; // default
    };

    // Gradient overlay for featured cards
    const gradientOverlay = gradient && !variant.includes('gradient') ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-inherit pointer-events-none" />
    ) : null;

    const cardContent = (
        <div
            className={`
                relative overflow-hidden
                ${currentVariant.bg}
                ${border ? currentVariant.border : 'border-transparent'}
                ${currentShadow}
                ${radius.md}
                ${getPaddingClass()}
                ${hoverClasses}
                ${interactiveClasses}
                ${featuredClasses}
                ${currentVariant.text || ''}
                ${className}
            `}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {gradientOverlay}
            {children}

            {/* Interactive arrow indicator */}
            {interactive && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRightIcon className="w-5 h-5 text-primary-600" />
                </div>
            )}
        </div>
    );

    // Wrap with motion if animation is enabled
    if (animation !== 'none') {
        return (
            <motion.div
                initial={currentAnimation.initial}
                animate={currentAnimation.animate}
                transition={currentAnimation.transition}
                className="group"
            >
                {cardContent}
            </motion.div>
        );
    }

    return <div className="group">{cardContent}</div>;
};

// Pre-configured card components matching landing page sections

// Stats Card - for dashboard metrics
export const StatsCard = ({ title, value, icon: Icon, change, color = 'primary', onClick }) => {
    const colors = {
        primary: 'bg-primary-50 text-primary-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        gray: 'bg-gray-50 text-gray-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        pink: 'bg-pink-50 text-pink-600',
    };

    return (
        <Card
            variant="stats"
            hover={true}
            interactive={!!onClick}
            onClick={onClick}
            padding="md"
            className="cursor-pointer"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${colors[color] || colors.primary}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {change && (
                    <span className={`text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </Card>
    );
};

// Feature Card - for landing page features
export const FeatureCard = ({ icon: Icon, title, description, color = 'primary' }) => {
    const colors = {
        primary: 'bg-primary-100 text-primary-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        pink: 'bg-pink-100 text-pink-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        indigo: 'bg-indigo-100 text-indigo-600',
    };

    return (
        <Card variant="feature" hover={true} padding="lg" className="text-center md:text-left">
            <div className={`w-12 h-12 ${colors[color] || colors.primary} rounded-lg flex items-center justify-center mb-4 mx-auto md:mx-0`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </Card>
    );
};

// Result Card - for prediction results
export const ResultCard = ({ risk, probability, factors, onViewDetails }) => {
    const riskConfig = {
        low: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: ShieldCheckIcon,
            text: 'text-green-700',
            badge: 'Low Risk',
        },
        moderate: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: ChartBarIcon,
            text: 'text-yellow-700',
            badge: 'Moderate Risk',
        },
        high: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: BeakerIcon,
            text: 'text-red-700',
            badge: 'High Risk',
        },
    };

    const config = riskConfig[risk?.toLowerCase()] || riskConfig.low;
    const Icon = config.icon;

    return (
        <Card variant="result" padding="lg" gradient={false}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${config.bg}`}>
                    <Icon className={`w-8 h-8 ${config.text}`} />
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                    {config.badge}
                </span>
            </div>

            <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Risk Probability</p>
                <p className="text-3xl font-bold text-gray-900">{probability}%</p>
            </div>

            {factors && factors.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Key Factors</p>
                    <div className="space-y-2">
                        {factors.slice(0, 3).map((factor, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{factor.name}</span>
                                <span className="font-medium text-gray-900">{factor.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {onViewDetails && (
                <button
                    onClick={onViewDetails}
                    className="w-full mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                >
                    View Full Report
                </button>
            )}
        </Card>
    );
};

// Health Metric Card
export const HealthMetricCard = ({ title, value, unit, icon: Icon, trend, color = 'primary' }) => {
    const colors = {
        primary: 'bg-primary-50 text-primary-600',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <Card variant="stats" hover={true} padding="md">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${colors[color] || colors.primary}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500">{title}</span>
            </div>
            <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                    {value}
                    {unit && <span className="text-sm text-gray-400 ml-1">{unit}</span>}
                </span>
                {trend && (
                    <span className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
        </Card>
    );
};

// Tip Card - for health tips
export const TipCard = ({ tip, icon: Icon, onMoreTips }) => {
    return (
        <Card variant="gradient" padding="lg">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{tip.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                    {onMoreTips && (
                        <button
                            onClick={onMoreTips}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                        >
                            More Tips
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

// Achievement Card
export const AchievementCard = ({ achievement, progress }) => {
    return (
        <Card variant="default" padding="md" hover={true}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <achievement.icon className={`w-5 h-5 ${achievement.earned ? 'text-yellow-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                    <p className="font-medium text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                    {progress && (
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                            <div
                                className="bg-primary-600 h-1 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>
                {achievement.earned && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Earned</span>
                )}
            </div>
        </Card>
    );
};

// Medication Card
export const MedicationCard = ({ medication, onTake, onEdit }) => {
    const getStatusColor = () => {
        if (medication.taken) return 'bg-green-100 text-green-700';
        const now = new Date();
        const [hours, minutes] = medication.nextDose.split(':').map(Number);
        const doseTime = new Date().setHours(hours, minutes, 0, 0);
        return doseTime < now ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
    };

    return (
        <Card variant="default" padding="md" hover={true}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <BeakerIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                        <p className="text-sm text-gray-600">{medication.dosage}</p>
                        <p className="text-xs text-gray-500 mt-1">Next: {medication.nextDose}</p>
                    </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
                    {medication.taken ? 'Taken' : 'Due'}
                </span>
            </div>
            {(onTake || onEdit) && (
                <div className="mt-3 flex gap-2">
                    {onTake && (
                        <button
                            onClick={() => onTake(medication.id)}
                            disabled={medication.taken}
                            className="flex-1 text-sm bg-primary-600 text-white py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Take
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(medication.id)}
                            className="px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Edit
                        </button>
                    )}
                </div>
            )}
        </Card>
    );
};

export default Card;