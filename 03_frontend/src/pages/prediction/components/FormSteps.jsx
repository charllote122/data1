import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const FormSteps = ({ steps, currentStep }) => {
    return (
        <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">
                <div
                    className="h-1 bg-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                                        ? 'bg-primary-600 border-primary-600 text-white'
                                        : isCurrent
                                            ? 'border-primary-600 bg-white text-primary-600'
                                            : 'border-gray-300 bg-white text-gray-400'
                                    }`}
                            >
                                {isCompleted ? (
                                    <CheckIcon className="w-5 h-5" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <span className={`text-sm font-medium ${isCurrent ? 'text-primary-600' : 'text-gray-500'
                                    }`}>
                                    {step.name}
                                </span>
                                <p className="text-xs text-gray-400">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FormSteps;