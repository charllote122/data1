import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline';

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openItems, setOpenItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All Questions' },
        { id: 'general', name: 'General' },
        { id: 'prediction', name: 'Predictions' },
        { id: 'account', name: 'Account' },
        { id: 'data', name: 'Data & Privacy' },
        { id: 'technical', name: 'Technical' },
    ];

    const faqs = [
        {
            id: 1,
            category: 'general',
            question: 'What is diabetes risk prediction?',
            answer: 'Diabetes risk prediction uses machine learning algorithms to analyze your health data and estimate your likelihood of developing diabetes. It considers factors like age, BMI, family history, lifestyle choices, and existing health conditions to provide a personalized risk assessment.',
        },
        {
            id: 2,
            category: 'general',
            question: 'How accurate are the predictions?',
            answer: 'Our model achieves approximately 85% accuracy based on validation with real patient data. However, it\'s important to remember that this is a screening tool and not a medical diagnosis. Always consult with healthcare professionals for proper medical advice.',
        },
        {
            id: 3,
            category: 'prediction',
            question: 'What factors are considered in the risk assessment?',
            answer: 'We consider multiple factors including age, gender, BMI, blood pressure, cholesterol levels, physical activity, diet, smoking status, alcohol consumption, family history of diabetes, and general health status. Each factor contributes differently to your overall risk score.',
        },
        {
            id: 4,
            category: 'prediction',
            question: 'How often should I do a risk assessment?',
            answer: 'We recommend doing a risk assessment every 3-6 months, or whenever there are significant changes in your health or lifestyle. Regular monitoring helps track your progress and the effectiveness of lifestyle changes.',
        },
        {
            id: 5,
            category: 'account',
            question: 'Is my health data secure?',
            answer: 'Yes, we take data security seriously. All personal health information is encrypted and stored securely. We comply with healthcare data protection regulations and never share your personal information without your consent.',
        },
        {
            id: 6,
            category: 'account',
            question: 'Can I delete my account and data?',
            answer: 'Yes, you can delete your account and all associated data at any time through your profile settings. This will permanently remove all your information from our systems.',
        },
        {
            id: 7,
            category: 'data',
            question: 'How is my data used?',
            answer: 'Your data is primarily used to provide you with personalized risk assessments and health recommendations. With your permission, anonymized data may be used for research to improve our algorithms and contribute to diabetes research.',
        },
        {
            id: 8,
            category: 'data',
            question: 'Can I export my health data?',
            answer: 'Yes, you can export all your health data including prediction history, health metrics, and personal information in various formats (CSV, JSON, PDF) from the settings page.',
        },
        {
            id: 9,
            category: 'technical',
            question: 'What is SHAP and LIME in the results?',
            answer: 'SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations) are explainable AI techniques that show which factors most influenced your prediction. They help you understand why you received a particular risk score.',
        },
        {
            id: 10,
            category: 'technical',
            question: 'Is the app available on mobile?',
            answer: 'Yes, our web application is fully responsive and works on all devices. You can also install it as a Progressive Web App (PWA) on your mobile device for a native app-like experience.',
        },
    ];

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleItem = (id) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
                <p className="text-gray-600 mt-2">Find answers to common questions about diabetes risk prediction</p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
            >
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-12 py-4 text-lg"
                />
            </motion.div>

            {/* Categories */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-2"
            >
                {categories.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </motion.div>

            {/* FAQ Items */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
            >
                {filteredFaqs.map((faq, index) => (
                    <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden"
                    >
                        <button
                            onClick={() => toggleItem(faq.id)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start space-x-3">
                                <QuestionMarkCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                <span className="font-medium text-gray-900">{faq.question}</span>
                            </div>
                            <ChevronDownIcon
                                className={`w-5 h-5 text-gray-500 transition-transform ${openItems.includes(faq.id) ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        <AnimatePresence>
                            {openItems.includes(faq.id) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-6 pb-4"
                                >
                                    <div className="pl-8 text-gray-600 border-l-2 border-primary-200">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </motion.div>

            {/* Still Have Questions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8 text-center"
            >
                <BookOpenIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h2>
                <p className="text-gray-600 mb-4">Can't find the answer you're looking for? Please reach out to our support team.</p>
                <button className="btn-primary">
                    Contact Support
                </button>
            </motion.div>
        </div>
    );
};

export default FAQ;