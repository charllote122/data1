// src/pages/health-coach/SymptomChecker.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DocumentTextIcon,
    PlusIcon,
    TrashIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    SparklesIcon,
    InformationCircleIcon,
    HeartIcon,
    ShieldCheckIcon,
    PhoneIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import aiService from '../../services/aiService';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SymptomChecker = () => {
    const { user } = useAuth();
    const [symptoms, setSymptoms] = useState([]);
    const [currentSymptom, setCurrentSymptom] = useState('');
    const [duration, setDuration] = useState('');
    const [severity, setSeverity] = useState('moderate');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [medicalConditions, setMedicalConditions] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [showEmergency, setShowEmergency] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('symptomHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Save history to localStorage when it changes
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem('symptomHistory', JSON.stringify(history));
        }
    }, [history]);

    // Symptom database
    const symptomDatabase = [
        { id: 'headache', name: 'Headache', category: 'head', emoji: '🤕' },
        { id: 'migraine', name: 'Migraine', category: 'head', emoji: '😫' },
        { id: 'dizziness', name: 'Dizziness', category: 'head', emoji: '😵' },
        { id: 'chest-pain', name: 'Chest pain', category: 'chest', emoji: '💔' },
        { id: 'shortness-breath', name: 'Shortness of breath', category: 'chest', emoji: '🫁' },
        { id: 'cough', name: 'Cough', category: 'respiratory', emoji: '🤧' },
        { id: 'abdominal-pain', name: 'Abdominal pain', category: 'abdominal', emoji: '🤢' },
        { id: 'nausea', name: 'Nausea', category: 'abdominal', emoji: '🤢' },
        { id: 'fever', name: 'Fever', category: 'general', emoji: '🌡️' },
        { id: 'fatigue', name: 'Fatigue', category: 'general', emoji: '😴' },
        { id: 'high-blood-sugar', name: 'High blood sugar', category: 'diabetes', emoji: '📈' },
        { id: 'low-blood-sugar', name: 'Low blood sugar', category: 'diabetes', emoji: '📉' },
        { id: 'blurred-vision', name: 'Blurred vision', category: 'diabetes', emoji: '👓' },
        { id: 'numbness-feet', name: 'Numbness in feet', category: 'diabetes', emoji: '🦶' },
        { id: 'excessive-thirst', name: 'Excessive thirst', category: 'diabetes', emoji: '🥤' },
        { id: 'frequent-urination', name: 'Frequent urination', category: 'diabetes', emoji: '🚽' },
    ];

    const severityOptions = [
        { id: 'mild', label: 'Mild', color: 'green', emoji: '😊', description: 'Noticeable but not interfering' },
        { id: 'moderate', label: 'Moderate', color: 'yellow', emoji: '😐', description: 'Interfering with activities' },
        { id: 'severe', label: 'Severe', color: 'orange', emoji: '😟', description: 'Significantly interfering' },
        { id: 'emergency', label: 'Emergency', color: 'red', emoji: '🚨', description: 'Requires immediate care' },
    ];

    const durationOptions = [
        { value: 'hours', label: 'Few hours', emoji: '⏱️' },
        { value: 'day', label: '1 day', emoji: '📅' },
        { value: 'days', label: '2-3 days', emoji: '📆' },
        { value: 'week', label: 'About a week', emoji: '🗓️' },
        { value: 'weeks', label: 'More than a week', emoji: '📊' },
        { value: 'month', label: 'About a month', emoji: '📈' },
        { value: 'months', label: 'Several months', emoji: '🔄' },
    ];

    const commonConditions = [
        'Diabetes', 'High blood pressure', 'Asthma', 'Allergies',
        'Heart disease', 'Arthritis', 'Anxiety', 'Depression',
        'Thyroid issues', 'Kidney disease'
    ];

    const emergencyKeywords = [
        'chest pain', 'shortness of breath', 'difficulty breathing',
        'unconscious', 'seizure', 'low blood sugar', 'severe bleeding',
        'head injury', 'stroke', 'heart attack'
    ];

    const toggleMedicalCondition = (condition) => {
        setMedicalConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const addSymptom = (symptomName) => {
        if (symptomName && !symptoms.includes(symptomName)) {
            setSymptoms([...symptoms, symptomName]);
            setCurrentSymptom('');
            setSearchTerm('');

            const isEmergency = emergencyKeywords.some(keyword =>
                symptomName.toLowerCase().includes(keyword)
            );
            if (isEmergency) {
                setShowEmergency(true);
                toast.error('⚠️ Emergency symptoms detected!', { duration: 5000 });
            }
        }
    };

    const removeSymptom = (symptom) => {
        setSymptoms(symptoms.filter(s => s !== symptom));
        if (symptoms.length <= 1) {
            setShowEmergency(false);
        }
    };

    const clearAll = () => {
        setSymptoms([]);
        setDuration('');
        setSeverity('moderate');
        setAge('');
        setGender('');
        setMedicalConditions([]);
        setAnalysis(null);
        setShowEmergency(false);
        toast.success('Cleared all inputs');
    };

    // ============================================
    // FIXED: Handle API response properly
    // ============================================
    const analyzeSymptoms = async () => {
        if (symptoms.length === 0) {
            toast.error('Please add at least one symptom');
            return;
        }

        if (!duration) {
            toast.error('Please select duration');
            return;
        }

        setLoading(true);
        try {
            toast.loading('🧑‍⚕️ Analyzing your symptoms...', { id: 'analysis' });

            const result = await aiService.analyzeSymptoms({
                symptoms,
                duration,
                severity,
                age,
                gender,
                medicalConditions
            });

            console.log('API Response:', result);

            // ============================================
            // Extract the actual analysis text from backend
            // ============================================
            let analysisText = '';
            let disclaimer = '⚠️ This is AI-generated information. NOT medical advice.';
            let model = 'AI Model';

            // Check if result exists
            if (result) {
                // Case 1: Direct analysis field (from your fixed backend)
                if (result.analysis && typeof result.analysis === 'string') {
                    analysisText = result.analysis;
                    disclaimer = result.disclaimer || disclaimer;
                    model = result.model || model;
                }
                // Case 2: Analysis in text field
                else if (result.text) {
                    analysisText = result.text;
                }
                // Case 3: Analysis in response field
                else if (result.response) {
                    analysisText = result.response;
                }
                // Case 4: Result itself is a string
                else if (typeof result === 'string') {
                    analysisText = result;
                }
                // Case 5: Fallback - generate from symptoms
                else {
                    analysisText = generateAnalysisText();
                }
            } else {
                analysisText = generateAnalysisText();
            }

            // Ensure we have text
            if (!analysisText || analysisText.trim() === '') {
                analysisText = generateAnalysisText();
            }

            // Create clean analysis object
            const cleanAnalysis = {
                text: analysisText,
                disclaimer: disclaimer,
                model: model,
                timestamp: new Date().toISOString()
            };

            setAnalysis(cleanAnalysis);

            // Add to history
            const historyItem = {
                id: Date.now(),
                symptoms: [...symptoms],
                duration,
                severity,
                timestamp: new Date().toISOString(),
                preview: analysisText.substring(0, 50) + '...'
            };
            setHistory(prev => [historyItem, ...prev].slice(0, 10));

            toast.success('✅ Analysis complete!', { id: 'analysis' });

        } catch (error) {
            console.error('Analysis error:', error);

            // Generate fallback analysis
            const fallbackText = generateAnalysisText();
            setAnalysis({
                text: fallbackText,
                disclaimer: "⚠️ Offline mode - using general guidance",
                model: "Offline Mode",
                timestamp: new Date().toISOString()
            });

            toast.success('📋 Analysis generated (offline)', { id: 'analysis' });
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // Generate analysis text from symptoms
    // ============================================
    const generateAnalysisText = () => {
        const hasDiabetes = medicalConditions.includes('Diabetes');
        const isEmergency = showEmergency || severity === 'emergency';
        const symptomsList = symptoms.join(', ');

        let text = `**SYMPTOM ANALYSIS REPORT**\n\n`;

        // Symptoms summary
        text += `**Your Symptoms:**\n`;
        symptoms.forEach(s => text += `• ${s}\n`);
        text += `\n**Duration:** ${durationOptions.find(d => d.value === duration)?.label || duration}\n`;
        text += `**Severity:** ${severityOptions.find(s => s.id === severity)?.label || severity}\n`;
        if (age) text += `**Age:** ${age}\n`;
        if (gender) text += `**Gender:** ${gender}\n`;
        if (medicalConditions.length > 0) {
            text += `**Medical Conditions:** ${medicalConditions.join(', ')}\n`;
        }
        text += `\n`;

        // Emergency warning
        if (isEmergency) {
            text += `**🚨 EMERGENCY - SEEK CARE IMMEDIATELY**\n`;
            text += `Your symptoms may require urgent medical attention. Please call emergency services or go to the nearest emergency room.\n\n`;
        }

        // Possible causes
        text += `**Possible Causes:**\n`;
        if (symptoms.some(s => s.includes('head') || s.includes('migraine'))) {
            text += `• Tension headache or migraine\n`;
            text += `• Stress and fatigue\n`;
            text += `• Dehydration\n`;
        }
        if (symptoms.some(s => s.includes('chest'))) {
            text += `• ⚠️ Chest symptoms ALWAYS require medical evaluation\n`;
        }
        if (symptoms.some(s => s.includes('blood sugar') || s.includes('diabetes'))) {
            text += `• Blood sugar fluctuations\n`;
            text += `• Medication timing or dosage issues\n`;
            text += `• Dietary factors\n`;
        }
        if (symptoms.some(s => s.includes('fever'))) {
            text += `• Viral or bacterial infection\n`;
        }
        if (symptoms.some(s => s.includes('fatigue'))) {
            text += `• Lack of sleep or poor sleep quality\n`;
            text += `• Anemia or nutritional deficiencies\n`;
        }
        if (hasDiabetes) {
            text += `• Diabetes-related complications\n`;
        }
        if (!isEmergency && symptoms.length > 0) {
            text += `• Common viral illness\n`;
            text += `• Stress-related symptoms\n`;
        }
        text += `\n`;

        // Self-care recommendations
        text += `**Self-Care Recommendations:**\n`;
        text += `1. Rest and get adequate sleep (7-9 hours)\n`;
        text += `2. Stay hydrated with water and electrolytes\n`;
        text += `3. Eat light, nutritious foods\n`;
        if (hasDiabetes) {
            text += `4. Monitor blood sugar more frequently\n`;
            text += `5. Take medications as prescribed\n`;
        } else {
            text += `4. Over-the-counter remedies as appropriate\n`;
        }
        text += `5. Avoid strenuous activities until symptoms improve\n\n`;

        // When to see a doctor
        text += `**When to See a Doctor:**\n`;
        text += `• Symptoms persist for more than 3 days\n`;
        text += `• Symptoms worsen despite home care\n`;
        text += `• You develop new or concerning symptoms\n`;
        text += `• You have underlying health conditions\n`;
        text += `• You're concerned about your symptoms\n\n`;

        // Red flags
        text += `**🚨 Red Flags (Seek Immediate Care):**\n`;
        text += `• Chest pain or pressure\n`;
        text += `• Difficulty breathing\n`;
        text += `• Severe headache or confusion\n`;
        text += `• High fever (>103°F / 39.4°C)\n`;
        text += `• Severe abdominal pain\n`;
        text += `• Uncontrolled bleeding\n`;
        text += `• Loss of consciousness\n`;

        return text;
    };

    const isEmergencySymptom = () => {
        return symptoms.some(s =>
            emergencyKeywords.some(keyword => s.toLowerCase().includes(keyword))
        ) || severity === 'emergency';
    };

    // Format text for display
    const formatText = (text) => {
        if (!text) return [];

        return text.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return { type: 'header', content: line.replace(/\*\*/g, ''), key: i };
            } else if (line.startsWith('•')) {
                return { type: 'bullet', content: line.substring(1).trim(), key: i };
            } else if (line.match(/^\d\./)) {
                return { type: 'numbered', content: line, key: i };
            } else if (line.startsWith('⚠️') || line.startsWith('🚨')) {
                return { type: 'warning', content: line, key: i };
            } else if (line.trim()) {
                return { type: 'text', content: line, key: i };
            }
            return null;
        }).filter(item => item !== null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Column */}
            <div className="lg:col-span-1">
                <Card className="sticky top-20">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Symptom Checker</h3>
                            {symptoms.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Emergency Warning */}
                        <AnimatePresence>
                            {showEmergency && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                                >
                                    <p className="text-sm text-red-800 font-medium flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-5 h-5" />
                                        Emergency symptoms detected
                                    </p>
                                    <p className="text-xs text-red-600 mt-1">
                                        If severe, seek immediate medical attention
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Symptom Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Symptoms
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Type to search..."
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            />
                            {searchTerm && (
                                <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-white shadow-lg">
                                    {symptomDatabase
                                        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => addSymptom(s.name)}
                                                className="block w-full text-left p-2 hover:bg-primary-50 rounded transition-colors"
                                            >
                                                <span className="mr-2">{s.emoji}</span>
                                                {s.name}
                                            </button>
                                        ))}
                                    {symptomDatabase.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                        <button
                                            onClick={() => addSymptom(searchTerm)}
                                            className="block w-full text-left p-2 text-primary-600 hover:bg-primary-50 rounded"
                                        >
                                            <PlusIcon className="w-4 h-4 inline mr-1" />
                                            Add "{searchTerm}"
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Symptoms */}
                        {symptoms.length > 0 && (
                            <div>
                                <p className="text-sm font-medium mb-2">Selected Symptoms:</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {symptoms.map(s => {
                                        const symptomData = symptomDatabase.find(sd => sd.name === s);
                                        return (
                                            <div key={s} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                                <span>
                                                    <span className="mr-2">{symptomData?.emoji || '🩺'}</span>
                                                    {s}
                                                </span>
                                                <button
                                                    onClick={() => removeSymptom(s)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                            >
                                <option value="">Select duration</option>
                                {durationOptions.map(d => (
                                    <option key={d.value} value={d.value}>{d.emoji} {d.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Severity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Severity Level
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {severityOptions.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSeverity(s.id)}
                                        className={`p-2 border rounded-lg text-center transition-all ${severity === s.id
                                            ? `border-${s.color}-500 bg-${s.color}-50 ring-2 ring-${s.color}-200`
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="text-lg block">{s.emoji}</span>
                                        <span className={`text-xs font-medium text-${s.color}-700`}>
                                            {s.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Patient Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="Years"
                                    min="0"
                                    max="120"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
                                >
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Medical Conditions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Medical Conditions
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {commonConditions.map(condition => (
                                    <button
                                        key={condition}
                                        onClick={() => toggleMedicalCondition(condition)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${medicalConditions.includes(condition)
                                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                                            : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        {medicalConditions.includes(condition) ? '✓ ' : ''}{condition}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <button
                            onClick={analyzeSymptoms}
                            disabled={loading || symptoms.length === 0 || !duration}
                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    Analyze Symptoms
                                </>
                            )}
                        </button>

                        {/* Emergency Notice */}
                        <p className="text-xs text-gray-400 text-center">
                            ⚠️ For emergencies, call emergency services immediately
                        </p>
                    </div>
                </Card>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-64 flex flex-col items-center justify-center"
                        >
                            <LoadingSpinner size="lg" />
                            <p className="mt-4 text-gray-600">Analyzing your symptoms...</p>
                        </motion.div>
                    ) : analysis ? (
                        <motion.div
                            key="analysis"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card>
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <div className="flex items-center gap-2">
                                            <DocumentTextIcon className="w-5 h-5 text-primary-600" />
                                            <h3 className="text-lg font-semibold">Analysis Results</h3>
                                        </div>
                                        <Badge variant="info" size="sm">
                                            {analysis.model}
                                        </Badge>
                                    </div>

                                    {/* Emergency Warning */}
                                    {isEmergencySymptom() && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-medium text-red-800">🚨 Seek Medical Attention</h4>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Your symptoms may require emergency care. Please consult a healthcare provider immediately.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Disclaimer */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <ShieldCheckIcon className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-800">
                                                {analysis.disclaimer}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Analysis Text */}
                                    <div className="prose prose-sm max-w-none">
                                        {formatText(analysis.text).map((item) => {
                                            switch (item.type) {
                                                case 'header':
                                                    return (
                                                        <h4 key={item.key} className="font-bold text-gray-800 mt-4 mb-2">
                                                            {item.content}
                                                        </h4>
                                                    );
                                                case 'bullet':
                                                    return (
                                                        <div key={item.key} className="flex items-start gap-2 ml-4 mb-1">
                                                            <span className="text-primary-600 mt-1">•</span>
                                                            <p className="text-gray-700">{item.content}</p>
                                                        </div>
                                                    );
                                                case 'numbered':
                                                    return (
                                                        <div key={item.key} className="flex items-start gap-2 ml-2 mb-1">
                                                            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                            <p className="text-gray-700">{item.content}</p>
                                                        </div>
                                                    );
                                                case 'warning':
                                                    return (
                                                        <div key={item.key} className="bg-red-50 p-2 rounded-lg my-2">
                                                            <p className="text-sm text-red-700">{item.content}</p>
                                                        </div>
                                                    );
                                                default:
                                                    return item.content ? (
                                                        <p key={item.key} className="text-gray-700 mb-2">{item.content}</p>
                                                    ) : null;
                                            }
                                        })}
                                    </div>

                                    {/* Timestamp */}
                                    <p className="text-xs text-gray-400 text-right border-t pt-3">
                                        Analyzed: {new Date(analysis.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card className="h-64 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <DocumentTextIcon className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <p className="text-gray-500">Add symptoms and click analyze</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Get AI-powered insights about your symptoms
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SymptomChecker;