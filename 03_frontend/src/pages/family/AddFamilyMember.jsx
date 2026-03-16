// src/pages/family/AddFamilyMember.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealth } from '../../hooks/useHealth';
import { useNotification } from '../../context/NotificationContext';
import {
    UserPlusIcon,
    ArrowLeftIcon,
    HeartIcon,
    InformationCircleIcon,
    ShieldCheckIcon,
    ClockIcon,
    XMarkIcon,
    UserGroupIcon,
    BeakerIcon,
    CalendarIcon,
    DocumentTextIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { RELATIONSHIP_OPTIONS, CONDITION_OPTIONS } from './constants';

const schema = yup.object({
    relationship: yup.string().required('Relationship is required'),
    condition: yup.string().required('Condition is required'),
    age_at_diagnosis: yup.number()
        .nullable()
        .transform((value, originalValue) => originalValue === '' ? null : value)
        .min(0, 'Age must be positive')
        .max(120, 'Age must be less than 120'),
    is_deceased: yup.boolean(),
    age_at_death: yup.number()
        .nullable()
        .when('is_deceased', {
            is: true,
            then: (schema) => schema.required('Age at death is required').min(0, 'Age must be positive').max(120, 'Age must be less than 120'),
            otherwise: (schema) => schema.nullable().transform(() => null)
        }),
    notes: yup.string().max(500, 'Notes must be less than 500 characters'),
    genetic_testing: yup.boolean(),
    genetic_markers: yup.string().when('genetic_testing', {
        is: true,
        then: (schema) => schema.max(200, 'Genetic markers must be less than 200 characters'),
        otherwise: (schema) => schema.notRequired()
    })
});

const AddFamilyMember = () => {
    const navigate = useNavigate();
    const { addFamilyHistory, fetchFamilyHistory } = useHealth(); // Add fetchFamilyHistory
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            relationship: '',
            condition: '',
            age_at_diagnosis: '',
            is_deceased: false,
            age_at_death: '',
            notes: '',
            genetic_testing: false,
            genetic_markers: ''
        },
    });

    const selectedRelationship = watch('relationship');
    const selectedCondition = watch('condition');
    const isDeceased = watch('is_deceased');
    const geneticTesting = watch('genetic_testing');

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // Add genetic risk calculation
            const selectedConditionData = CONDITION_OPTIONS.find(c => c.value === data.condition);
            const geneticRiskScore = calculateGeneticRisk(data, selectedConditionData);

            const familyMemberData = {
                ...data,
                genetic_risk_score: geneticRiskScore,
                created_at: new Date().toISOString()
            };

            console.log('📤 Adding family member:', familyMemberData);

            // Call the actual API to add family member
            const result = await addFamilyHistory(familyMemberData);

            console.log('✅ Add result:', result);

            // Refresh the family history list
            await fetchFamilyHistory();

            showNotification('success', 'Family member added successfully');

            // Navigate back to family list
            navigate('/family');
        } catch (error) {
            console.error('❌ Error adding family member:', error);
            showNotification('error', error.message || 'Failed to add family member');
        } finally {
            setLoading(false);
        }
    };

    const calculateGeneticRisk = (data, conditionData) => {
        let score = 0;

        // Base risk from condition
        if (conditionData?.risk === 'high') score += 40;
        if (conditionData?.risk === 'moderate') score += 20;

        // Relationship factor
        if (['parent', 'child', 'sibling'].includes(data.relationship)) score += 30;
        if (['grandparent'].includes(data.relationship)) score += 15;

        // Age factor (earlier diagnosis = higher genetic component)
        if (data.age_at_diagnosis && data.age_at_diagnosis < 40) score += 20;
        else if (data.age_at_diagnosis && data.age_at_diagnosis < 60) score += 10;

        // Genetic testing confirmation
        if (data.genetic_testing && data.genetic_markers) score += 25;

        return Math.min(100, score);
    };

    const handleCancel = () => {
        navigate('/family');
    };

    const getRiskLevelColor = (risk) => {
        switch (risk) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'moderate':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const getSelectedConditionDetails = () => {
        return CONDITION_OPTIONS.find(c => c.value === selectedCondition);
    };

    const getRelationshipLabel = () => {
        return RELATIONSHIP_OPTIONS.find(r => r.value === selectedRelationship)?.label;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Family History
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <UserPlusIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add Family Member</h1>
                            <p className="text-gray-600 mt-1">Record medical history and genetic information</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white">Family Health Record</h2>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                                {/* Relationship */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <UserGroupIcon className="w-4 h-4 inline mr-1" />
                                        Relationship <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('relationship')}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition
                                            ${errors.relationship ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                    >
                                        <option value="">Select relationship</option>
                                        {RELATIONSHIP_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.relationship && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <XMarkIcon className="w-4 h-4" />
                                            {errors.relationship.message}
                                        </p>
                                    )}
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <BeakerIcon className="w-4 h-4 inline mr-1" />
                                        Medical Condition <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                                        {CONDITION_OPTIONS.map(option => (
                                            <label
                                                key={option.value}
                                                className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                                                    ${selectedCondition === option.value
                                                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    {...register('condition')}
                                                    value={option.value}
                                                    className="sr-only"
                                                />
                                                <span className="text-2xl">{option.emoji}</span>
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${getRiskLevelColor(option.risk)}`}>
                                                        {option.risk}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.condition && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                            <XMarkIcon className="w-4 h-4" />
                                            {errors.condition.message}
                                        </p>
                                    )}
                                </div>

                                {/* Age at Diagnosis */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                                        Age at Diagnosis <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="number"
                                            {...register('age_at_diagnosis')}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                ${errors.age_at_diagnosis ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                            placeholder="Enter age at diagnosis"
                                            min="0"
                                            max="120"
                                        />
                                    </div>
                                    {errors.age_at_diagnosis && (
                                        <p className="mt-1 text-sm text-red-600">{errors.age_at_diagnosis.message}</p>
                                    )}
                                </div>

                                {/* Deceased Status */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            {...register('is_deceased')}
                                            className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">This family member is deceased</span>
                                    </label>

                                    {isDeceased && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="ml-6"
                                        >
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Age at Death <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                {...register('age_at_death')}
                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                    ${errors.age_at_death ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                                placeholder="Enter age at death"
                                                min="0"
                                                max="120"
                                            />
                                            {errors.age_at_death && (
                                                <p className="mt-1 text-sm text-red-600">{errors.age_at_death.message}</p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Advanced Options */}
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <span>Advanced Options</span>
                                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {showAdvanced && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 space-y-4"
                                            >
                                                {/* Genetic Testing */}
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            {...register('genetic_testing')}
                                                            className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                                                        />
                                                        <span className="text-sm text-gray-700">Has undergone genetic testing</span>
                                                    </label>

                                                    {geneticTesting && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="ml-6"
                                                        >
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Genetic Markers Found
                                                            </label>
                                                            <textarea
                                                                {...register('genetic_markers')}
                                                                rows="2"
                                                                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition
                                                                    ${errors.genetic_markers ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                                                placeholder="e.g., BRCA1, HLA-DR3/DR4, etc."
                                                            />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                                        Additional Notes <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <textarea
                                        {...register('notes')}
                                        rows="3"
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition
                                            ${errors.notes ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`}
                                        placeholder="Any additional information about this family member's health history..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlusIcon className="w-5 h-5" />
                                                <span>Add Family Member</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Genetic Risk Preview */}
                        {selectedCondition && selectedRelationship && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-100"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Genetic Risk Assessment</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                            <HeartIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Relationship</p>
                                            <p className="font-medium text-gray-900 capitalize">{getRelationshipLabel()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <BeakerIcon className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Condition</p>
                                            <p className="font-medium text-gray-900">{getSelectedConditionDetails()?.label}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Risk Level</span>
                                            <span className={`text-xs px-3 py-1 rounded-full ${getRiskLevelColor(getSelectedConditionDetails()?.risk)}`}>
                                                {getSelectedConditionDetails()?.risk}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Genetic Component</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {getSelectedConditionDetails()?.risk === 'high' ? 'Strong' : 'Moderate'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50 p-4 rounded-xl">
                                        <p className="text-xs text-indigo-700">
                                            <span className="font-semibold">Recommendation:</span> Discuss this family history with your healthcare provider for personalized screening recommendations.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Information Card */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
                        >
                            <div className="flex items-start gap-3">
                                <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-blue-800 mb-3">Why track family history?</h3>
                                    <ul className="space-y-3 text-sm text-blue-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span>Identifies genetic predisposition</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span>Guides preventive screening</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span>Helps calculate risk scores</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span>Informs treatment decisions</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>

                        {/* Privacy Note */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs text-gray-500">
                                <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                                <span>Your family health data is encrypted and private</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFamilyMember;