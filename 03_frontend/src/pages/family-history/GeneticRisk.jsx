import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BeakerIcon,  // Changed from DnaIcon
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ChartBarIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useHealth } from '../../hooks/useHealth';
import Loader from '../../components/Loader';
import ProgressBar from '../../components/ProgressBar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GeneticRisk = () => {
    const { familyHistory, loading } = useHealth();
    const [riskScore, setRiskScore] = useState(0);
    const [riskFactors, setRiskFactors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        if (familyHistory.length > 0) {
            calculateGeneticRisk();
        }
    }, [familyHistory]);

    const calculateGeneticRisk = () => {
        let score = 50; // Base risk
        const factors = [];

        // Weight by relationship
        const relationshipWeight = {
            parent: 0.3,
            sibling: 0.3,
            child: 0.25,
            grandparent: 0.15,
            aunt: 0.1,
            uncle: 0.1,
            cousin: 0.05,
        };

        // Weight by condition
        const conditionWeight = {
            diabetes_t1: 1.3,
            diabetes_t2: 1.4,
            gestational: 1.1,
            heart_disease: 1.3,
            hypertension: 1.2,
            stroke: 1.25,
            obesity: 1.15,
            kidney_disease: 1.2,
        };

        // Calculate score and identify factors
        familyHistory.forEach(item => {
            const relWeight = relationshipWeight[item.relationship] || 0.1;
            const condWeight = conditionWeight[item.condition] || 1.0;
            const impact = relWeight * condWeight * 10;

            score += impact;

            factors.push({
                relationship: item.relationship,
                condition: item.condition,
                impact: impact.toFixed(1),
                age: item.age_at_diagnosis,
            });

            // Generate recommendations based on conditions
            generateRecommendations(item.condition);
        });

        setRiskScore(Math.min(Math.round(score), 100));
        setRiskFactors(factors);
    };

    const generateRecommendations = (condition) => {
        const recMap = {
            diabetes_t1: [
                'Regular blood sugar monitoring',
                'Annual eye exams',
                'Foot care checkups',
            ],
            diabetes_t2: [
                'Maintain healthy weight',
                'Regular exercise',
                'Balanced diet low in sugar',
                'Annual diabetes screening',
            ],
            heart_disease: [
                'Monitor blood pressure regularly',
                'Cholesterol screening',
                'Heart-healthy diet',
                'Regular cardiovascular exercise',
            ],
            hypertension: [
                'Daily blood pressure monitoring',
                'Reduce sodium intake',
                'Stress management techniques',
                'Regular checkups',
            ],
            stroke: [
                'Blood pressure control',
                'Medication adherence',
                'Healthy lifestyle maintenance',
                'Recognize stroke symptoms',
            ],
        };

        if (recMap[condition]) {
            setRecommendations(prev => [...new Set([...prev, ...recMap[condition]])]);
        }
    };

    const getRiskLevel = (score) => {
        if (score < 40) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
        if (score < 60) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        if (score < 80) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const getConditionLabel = (condition) => {
        const labels = {
            diabetes_t1: 'Type 1 Diabetes',
            diabetes_t2: 'Type 2 Diabetes',
            gestational: 'Gestational Diabetes',
            heart_disease: 'Heart Disease',
            hypertension: 'Hypertension',
            stroke: 'Stroke',
            obesity: 'Obesity',
            kidney_disease: 'Kidney Disease',
        };
        return labels[condition] || condition;
    };

    const getRelationshipLabel = (rel) => {
        const labels = {
            parent: 'Parent',
            child: 'Child',
            sibling: 'Sibling',
            grandparent: 'Grandparent',
            aunt: 'Aunt',
            uncle: 'Uncle',
            cousin: 'Cousin',
        };
        return labels[rel] || rel;
    };

    if (loading) {
        return <Loader />;
    }

    const riskLevel = getRiskLevel(riskScore);

    // Prepare chart data
    const chartData = riskFactors.map((factor, index) => ({
        name: `${getRelationshipLabel(factor.relationship)} - ${getConditionLabel(factor.condition)}`,
        impact: parseFloat(factor.impact),
    }));

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Genetic Risk Analysis</h1>
                <p className="text-gray-600 dark:text-gray-400">Understand your inherited risk factors</p>
            </motion.div>

            {familyHistory.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                    <BeakerIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No family history data available</p>
                    <a
                        href="/family-history/add"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                        Add Family History
                    </a>
                </motion.div>
            ) : (
                <>
                    {/* Risk Score Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                                <BeakerIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Your Genetic Risk Score
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Based on your family medical history
                            </p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <ProgressBar
                                value={riskScore}
                                max={100}
                                label="Genetic Risk"
                                showValue
                                color={
                                    riskScore < 40 ? 'success' :
                                        riskScore < 60 ? 'warning' :
                                            riskScore < 80 ? 'warning' : 'danger'
                                }
                                size="lg"
                            />

                            <div className="mt-4 text-center">
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${riskLevel.bg} dark:bg-opacity-20 ${riskLevel.color} dark:${riskLevel.color}`}>
                                    {riskLevel.level} Risk
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{familyHistory.length}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Family Members</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {new Set(familyHistory.map(f => f.condition)).size}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Unique Conditions</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {familyHistory.filter(f => f.age_at_diagnosis).length}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">With Age Data</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Risk Factors Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Risk Factor Impact</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        interval={0}
                                        stroke="#6B7280"
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <YAxis
                                        domain={[0, 'dataMax + 5']}
                                        stroke="#6B7280"
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '0.5rem',
                                            color: '#F3F4F6'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="impact"
                                        stroke="#3B82F6"
                                        strokeWidth={2}
                                        dot={{ fill: '#3B82F6', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Detailed Risk Factors */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detailed Risk Factors</h3>
                        <div className="space-y-4">
                            {riskFactors.map((factor, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {getRelationshipLabel(factor.relationship)} - {getConditionLabel(factor.condition)}
                                            </p>
                                            {factor.age && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Diagnosed at age {factor.age}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">+{factor.impact}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">risk points</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recommendations */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
                    >
                        <div className="flex items-center space-x-2 mb-4">
                            <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Preventive Recommendations</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                    <span className="text-blue-600 dark:text-blue-400">•</span>
                                    <span className="text-blue-700 dark:text-blue-300">{rec}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start space-x-3">
                                <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Next Steps</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Share this genetic risk assessment with your healthcare provider. They can provide personalized screening recommendations and preventive care strategies based on your family history.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Disclaimer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-gray-500 dark:text-gray-500 text-center"
                    >
                        <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
                        This analysis is for informational purposes only and should not replace professional medical advice.
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default GeneticRisk;