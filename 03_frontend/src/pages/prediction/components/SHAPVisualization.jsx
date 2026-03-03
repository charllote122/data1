import React from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const SHAPVisualization = ({ shapData }) => {
    if (!shapData || !shapData.features) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">SHAP analysis not available</p>
            </div>
        );
    }

    const { features, base_value, prediction } = shapData;

    // Sort features by absolute SHAP value
    const sortedFeatures = [...features].sort((a, b) =>
        Math.abs(b.shap_value) - Math.abs(a.shap_value)
    ).slice(0, 10);

    const maxAbsValue = Math.max(...sortedFeatures.map(f => Math.abs(f.shap_value)));

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-2">
                <h3 className="text-lg font-semibold text-gray-900">SHAP Feature Importance</h3>
                <div className="group relative">
                    <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                        SHAP values show how each feature contributes to the prediction
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {sortedFeatures.map((feature, index) => {
                    const percentage = (Math.abs(feature.shap_value) / maxAbsValue) * 100;
                    const isPositive = feature.shap_value > 0;

                    return (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative"
                        >
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 font-medium">{feature.name}</span>
                                <span className={`text-xs font-medium ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                                    {feature.shap_value > 0 ? '+' : ''}{feature.shap_value.toFixed(3)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className={`h-full ${isPositive ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{
                                            marginLeft: isPositive ? 'auto' : '0',
                                            float: isPositive ? 'right' : 'left'
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 w-16">
                                    {feature.value}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Base value:</span> {base_value?.toFixed(3)}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Final prediction:</span> {prediction?.toFixed(3)}
                </p>
            </div>
        </div>
    );
};

export default SHAPVisualization;