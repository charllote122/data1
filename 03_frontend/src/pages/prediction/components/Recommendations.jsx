import React from 'react';
import { motion } from 'framer-motion';
import {
    HeartIcon,
    BeakerIcon,
    ClockIcon,
    FireIcon,
    ScaleIcon,
    MoonIcon,
    SunIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

const Recommendations = ({ recommendations, riskLevel }) => {
    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No recommendations available</p>
            </div>
        );
    }

    const getIcon = (category) => {
        const icons = {
            diet: BeakerIcon,
            exercise: HeartIcon,
            lifestyle: SunIcon,
            medical: ClockIcon,
            weight: ScaleIcon,
            sleep: MoonIcon,
            general: SparklesIcon,
        };
        return icons[category] || SparklesIcon;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'text-red-600 bg-red-50 border-red-200',
            medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            low: 'text-green-600 bg-green-50 border-green-200',
        };
        return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <HeartIcon className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Personalized Recommendations
                </h3>
            </div>

            {riskLevel === 'high' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                    <p className="text-sm text-red-700">
                        <strong>Important:</strong> Based on your high risk score, we strongly recommend
                        consulting with a healthcare provider for proper evaluation and guidance.
                    </p>
                </motion.div>
            )}

            <div className="grid gap-4">
                {recommendations.map((rec, index) => {
                    const Icon = getIcon(rec.category);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${rec.category === 'medical' ? 'bg-red-50' :
                                    rec.category === 'diet' ? 'bg-green-50' :
                                        rec.category === 'exercise' ? 'bg-blue-50' :
                                            'bg-primary-50'
                                    }`}>
                                    <Icon className={`w-6 h-6 ${rec.category === 'medical' ? 'text-red-600' :
                                        rec.category === 'diet' ? 'text-green-600' :
                                            rec.category === 'exercise' ? 'text-blue-600' :
                                                'text-primary-600'
                                        }`} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">
                                            {rec.title}
                                        </h4>
                                        {rec.priority && (
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                                                {rec.priority.toUpperCase()} PRIORITY
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3">
                                        {rec.description}
                                    </p>

                                    {rec.steps && rec.steps.length > 0 && (
                                        <div className="mt-3">
                                            <p className="text-xs font-medium text-gray-500 mb-2">
                                                ACTION STEPS:
                                            </p>
                                            <ul className="space-y-1">
                                                {rec.steps.map((step, stepIndex) => (
                                                    <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                                        <span className="w-4 h-4 mt-0.5 flex-shrink-0">
                                                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-1.5" />
                                                        </span>
                                                        {step}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {rec.resources && rec.resources.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 mb-2">
                                                HELPFUL RESOURCES:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {rec.resources.map((resource, resIndex) => (
                                                    <a
                                                        key={resIndex}
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary-600 hover:text-primary-700 underline"
                                                    >
                                                        {resource.title}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700 flex items-start gap-2">
                    <SparklesIcon className="w-5 h-5 flex-shrink-0" />
                    <span>
                        These recommendations are generated based on your health profile and risk factors.
                        Always consult with healthcare professionals before making significant changes to your
                        diet, exercise, or medication routines.
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Recommendations;