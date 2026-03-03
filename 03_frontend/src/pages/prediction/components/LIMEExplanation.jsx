import React from 'react';
import { motion } from 'framer-motion';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const LIMEExplanation = ({ limeData }) => {
    if (!limeData || !limeData.features) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">LIME explanation not available</p>
            </div>
        );
    }

    const { features, prediction, confidence } = limeData;

    // Sort features by absolute weight
    const sortedFeatures = [...features].sort((a, b) =>
        Math.abs(b.weight) - Math.abs(a.weight)
    ).slice(0, 10);

    const maxWeight = Math.max(...sortedFeatures.map(f => Math.abs(f.weight)));

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-2">
                <h3 className="text-lg font-semibold text-gray-900">LIME Local Explanation</h3>
                <div className="group relative">
                    <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                        LIME explains individual predictions by learning an interpretable model locally
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-primary-600 mb-1">Prediction</p>
                    <p className="text-2xl font-bold text-primary-700">
                        {(prediction * 100).toFixed(1)}%
                    </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-gray-700">
                        {(confidence * 100).toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Contributing Factors</h4>
                {sortedFeatures.map((feature, index) => {
                    const percentage = (Math.abs(feature.weight) / maxWeight) * 100;
                    const isPositive = feature.weight > 0;

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative"
                        >
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">{feature.name}</span>
                                <span className={`text-xs font-medium ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                                    {feature.weight > 0 ? '+' : ''}{feature.weight.toFixed(3)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 0.5 }}
                                        className={`h-full ${isPositive ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{
                                            marginLeft: isPositive ? 'auto' : '0',
                                            float: isPositive ? 'right' : 'left'
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 w-20">
                                    {feature.value}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default LIMEExplanation;