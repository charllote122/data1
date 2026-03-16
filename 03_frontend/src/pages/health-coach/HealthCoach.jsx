// src/pages/health-coach/HealthCoach.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChatBubbleLeftRightIcon,
    HeartIcon,
    DocumentTextIcon,
    SparklesIcon,
    ArrowLeftIcon,
    ClockIcon,
    InformationCircleIcon,
    BeakerIcon,
    FireIcon,
    SunIcon,
} from '@heroicons/react/24/outline';
import ChatInterface from './ChatInterface';
import DietPlanner from './DietPlanner';
import SymptomChecker from './SymptomChecker';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const HealthCoach = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('chat');
    const [showTips, setShowTips] = useState(false);
    const [greeting, setGreeting] = useState('');

    // Set greeting based on time of day
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    // Check if we have a tab from navigation state
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const tabs = [
        {
            id: 'chat',
            name: 'AI Chat',
            icon: ChatBubbleLeftRightIcon,
            description: 'Ask me anything about your health',
            color: 'primary',
            gradient: 'from-primary-500 to-primary-600',
            lightBg: 'bg-primary-50',
            stats: '24/7 available'
        },
        {
            id: 'diet',
            name: 'Diet Planner',
            icon: HeartIcon,
            description: 'Personalized meal plans',
            color: 'green',
            gradient: 'from-green-500 to-emerald-600',
            lightBg: 'bg-green-50',
            stats: 'AI-generated meals'
        },
        {
            id: 'symptoms',
            name: 'Symptom Checker',
            icon: DocumentTextIcon,
            description: 'Check and analyze symptoms',
            color: 'orange',
            gradient: 'from-orange-500 to-orange-600',
            lightBg: 'bg-orange-50',
            stats: 'Instant analysis'
        },
    ];

    const tips = {
        chat: [
            "Ask about diabetes-friendly foods",
            "Get exercise recommendations",
            "Learn about blood sugar management",
            "Discuss medication concerns",
            "Understand your lab results"
        ],
        diet: [
            "Tell us your food preferences",
            "Mention any allergies",
            "Specify your calorie goals",
            "Request cuisine types",
            "Ask for seasonal options"
        ],
        symptoms: [
            "Describe your symptoms clearly",
            "Mention when they started",
            "Note what makes them better/worse",
            "Include severity (1-10 scale)",
            "Mention any triggers"
        ]
    };

    const getTabStyles = (tabId, isActive) => {
        const tab = tabs.find(t => t.id === tabId);
        if (isActive) {
            return {
                button: `text-${tab?.color}-700 bg-${tab?.color}-50 border-b-2 border-${tab?.color}-500`,
                icon: `text-${tab?.color}-600`
            };
        }
        return {
            button: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
            icon: 'text-gray-400 group-hover:text-gray-600'
        };
    };

    const getTabIcon = (tabId, isActive) => {
        const TabIcon = tabs.find(t => t.id === tabId)?.icon;
        const styles = getTabStyles(tabId, isActive);
        return <TabIcon className={`w-5 h-5 ${styles.icon}`} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(-1)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </motion.button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">AI Health Coach</h1>
                                    <p className="text-xs text-gray-500">{greeting}! How can I help you today?</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Badge and Tips Toggle */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowTips(!showTips)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all relative"
                                title={showTips ? 'Hide tips' : 'Show tips'}
                            >
                                <InformationCircleIcon className="w-5 h-5" />
                                {showTips && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                )}
                            </motion.button>
                            <Badge variant="primary" size="sm" className="shadow-sm">
                                <ClockIcon className="w-3 h-3 mr-1" />
                                Free
                            </Badge>
                        </div>
                    </div>

                    {/* Tips Panel */}
                    <AnimatePresence>
                        {showTips && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <Card className="mb-4 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary-100 rounded-lg">
                                            <SparklesIcon className="w-4 h-4 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                                Tips for {tabs.find(t => t.id === activeTab)?.name}:
                                            </h3>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {tips[activeTab].map((tip, index) => (
                                                    <motion.li
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-center gap-2 text-sm text-gray-600"
                                                    >
                                                        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                                                        {tip}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>
                                        <button
                                            onClick={() => setShowTips(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <span className="text-xl">&times;</span>
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tabs */}
                    <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const styles = getTabStyles(tab.id, isActive);
                            
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ y: -1 }}
                                    whileTap={{ y: 0 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group relative flex items-center space-x-3 px-5 py-3 text-sm font-medium rounded-t-xl transition-all
                                        ${styles.button}`}
                                    title={tab.description}
                                >
                                    <tab.icon className={`w-5 h-5 ${styles.icon}`} />
                                    <span>{tab.name}</span>
                                    
                                    {/* Stats badge */}
                                    <Badge 
                                        variant={tab.color} 
                                        size="sm" 
                                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {tab.stats}
                                    </Badge>
                                    
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.gradient}`}
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
                        <div className="flex items-center gap-2">
                            <BeakerIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Blood Sugar</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-1">Track & Monitor</p>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 p-3">
                        <div className="flex items-center gap-2">
                            <FireIcon className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-600">Meal Plan</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-1">Personalized</p>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 p-3">
                        <div className="flex items-center gap-2">
                            <SunIcon className="w-4 h-4 text-orange-600" />
                            <span className="text-xs text-gray-600">Activity</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mt-1">Daily Goals</p>
                    </Card>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChatInterface />
                        </motion.div>
                    )}

                    {activeTab === 'diet' && (
                        <motion.div
                            key="diet"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DietPlanner />
                        </motion.div>
                    )}

                    {activeTab === 'symptoms' && (
                        <motion.div
                            key="symptoms"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <SymptomChecker />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Help Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowTips(true)}
                className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-20"
                title="Need help?"
            >
                <InformationCircleIcon className="w-6 h-6" />
            </motion.button>

            {/* Keyboard Shortcuts Hint */}
            <div className="fixed bottom-6 left-6 hidden md:block">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-xs text-gray-500 border border-gray-200">
                    <span className="font-mono">⌘1</span> Chat •{' '}
                    <span className="font-mono">⌘2</span> Diet •{' '}
                    <span className="font-mono">⌘3</span> Symptoms
                </div>
            </div>

            {/* Keyboard shortcuts */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        document.addEventListener('keydown', function(e) {
                            if (e.metaKey || e.ctrlKey) {
                                if (e.key === '1') {
                                    e.preventDefault();
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'chat' }));
                                }
                                if (e.key === '2') {
                                    e.preventDefault();
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'diet' }));
                                }
                                if (e.key === '3') {
                                    e.preventDefault();
                                    window.dispatchEvent(new CustomEvent('changeTab', { detail: 'symptoms' }));
                                }
                            }
                        });
                        
                        window.addEventListener('changeTab', function(e) {
                            const tab = e.detail;
                            const button = document.querySelector(\`button[data-tab="\${tab}"]\`);
                            if (button) button.click();
                        });
                    `
                }}
            />
        </div>
    );
};

export default HealthCoach;