import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const FormSteps = ({ steps, currentStep }) => {
    return (
        <div className="relative py-4">
            {/* Progress Bar Background */}
            <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 rounded-full">
                <div
                    className="h-1 bg-primary-600 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center">
                            {/* Step Circle */}
                            <div
                                className={`
                                    w-12 h-12 rounded-full flex items-center justify-center border-2 
                                    transition-all duration-300 relative bg-white
                                    ${isCompleted
                                        ? 'border-primary-600 bg-primary-600 text-white'
                                        : isCurrent
                                            ? 'border-primary-600 text-primary-600 ring-4 ring-primary-100'
                                            : 'border-gray-300 text-gray-400'
                                    }
                                `}
                            >
                                {isCompleted ? (
                                    <CheckIcon className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </div>

                            {/* Step Label */}
                            <div className="mt-3 text-center max-w-[120px]">
                                <span
                                    className={`
                                        text-sm font-medium block
                                        ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                                    `}
                                >
                                    {step.name}
                                </span>
                                <span className="text-xs text-gray-400 hidden sm:block">
                                    {step.description}
                                </span>
                            </div>

                            {/* Connector Line (except for last step) */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                                        absolute hidden sm:block w-full h-0.5 top-6 
                                        -translate-y-1/2 transition-all duration-500
                                    `}
                                    style={{
                                        left: `calc(${(index + 0.5) * (100 / steps.length)}%)`,
                                        width: `${100 / steps.length}%`,
                                        background: isCompleted
                                            ? 'linear-gradient(to right, #2563eb, #2563eb)'
                                            : 'transparent'
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Current Step Description (Mobile) */}
            <div className="mt-6 text-center sm:hidden">
                <p className="text-sm text-gray-600">
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
                </p>
            </div>
        </div>
    );
};

export default FormSteps;