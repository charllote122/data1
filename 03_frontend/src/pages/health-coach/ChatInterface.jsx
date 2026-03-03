import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon,
    LightBulbIcon,
    BeakerIcon,
    ClockIcon,
    DocumentTextIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChatInterface = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: "👋 Hi! I'm your AI Health Coach. I can help you with:\n\n• Diabetes-related questions\n• Diet and nutrition advice\n• Medication reminders\n• Symptom checking\n• Lifestyle recommendations\n\nWhat would you like to know today?",
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setLoading(true);

        try {
            // Simulate AI response (replace with actual API call)
            setTimeout(() => {
                const botResponse = generateAIResponse(inputMessage);
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    type: 'bot',
                    content: botResponse,
                    timestamp: new Date(),
                }]);
                setLoading(false);
            }, 1500);
        } catch (error) {
            toast.error('Failed to get response');
            setLoading(false);
        }
    };

    const generateAIResponse = (message) => {
        const lowercaseMsg = message.toLowerCase();

        if (lowercaseMsg.includes('diet') || lowercaseMsg.includes('eat') || lowercaseMsg.includes('food')) {
            return "🥗 **Diet Recommendations for Diabetes:**\n\n" +
                "• Focus on non-starchy vegetables (leafy greens, broccoli, cauliflower)\n" +
                "• Choose lean proteins (chicken, fish, tofu, legumes)\n" +
                "• Include healthy fats (avocado, nuts, olive oil)\n" +
                "• Limit refined carbs and sugary foods\n" +
                "• Eat regular meals to maintain stable blood sugar\n\n" +
                "Would you like specific meal ideas or a personalized meal plan?";
        }

        else if (lowercaseMsg.includes('exercise') || lowercaseMsg.includes('workout') || lowercaseMsg.includes('activity')) {
            return "🏃 **Exercise Recommendations:**\n\n" +
                "• Aim for 150 minutes of moderate activity per week\n" +
                "• Include both cardio and strength training\n" +
                "• Try: brisk walking, swimming, cycling, yoga\n" +
                "• Check blood sugar before and after exercise\n" +
                "• Stay hydrated and carry a snack\n\n" +
                "Start with 10-15 minute sessions and gradually increase!";
        }

        else if (lowercaseMsg.includes('medication') || lowercaseMsg.includes('medicine') || lowercaseMsg.includes('pill')) {
            return "💊 **Medication Tips:**\n\n" +
                "• Take medications at the same time daily\n" +
                "• Use a pill organizer to avoid missed doses\n" +
                "• Set reminders on your phone\n" +
                "• Never skip doses without consulting your doctor\n" +
                "• Keep a list of all medications and dosages\n\n" +
                "Would you like to set up medication reminders?";
        }

        else if (lowercaseMsg.includes('symptom') || lowercaseMsg.includes('feeling') || lowercaseMsg.includes('pain')) {
            return "🔍 **Symptom Checker:**\n\n" +
                "Common diabetes symptoms to watch for:\n" +
                "• Increased thirst and urination\n" +
                "• Unexplained weight loss\n" +
                "• Fatigue and weakness\n" +
                "• Blurred vision\n" +
                "• Slow-healing wounds\n" +
                "• Numbness in hands/feet\n\n" +
                "Please describe your symptoms in more detail for personalized advice.";
        }

        else if (lowercaseMsg.includes('blood sugar') || lowercaseMsg.includes('glucose')) {
            return "📊 **Blood Sugar Management:**\n\n" +
                "• Target range: 80-130 mg/dL before meals\n" +
                "• Check regularly and log your readings\n" +
                "• Understand how food affects your levels\n" +
                "• Stay consistent with meal timing\n" +
                "• Contact your doctor if readings are consistently high/low\n\n" +
                "Would you like to track your blood sugar readings?";
        }

        else if (lowercaseMsg.includes('stress') || lowercaseMsg.includes('anxiety') || lowercaseMsg.includes('mental')) {
            return "🧘 **Stress Management:**\n\n" +
                "• Practice deep breathing exercises\n" +
                "• Try meditation or mindfulness\n" +
                "• Get adequate sleep (7-9 hours)\n" +
                "• Stay connected with loved ones\n" +
                "• Consider talking to a counselor\n\n" +
                "Stress can affect blood sugar levels. Would you like some relaxation techniques?";
        }

        else {
            return "I'm here to help with your diabetes management! I can provide information about:\n\n" +
                "• Diet and nutrition 🥗\n" +
                "• Exercise and activity 🏃\n" +
                "• Medication management 💊\n" +
                "• Symptom checking 🔍\n" +
                "• Blood sugar monitoring 📊\n" +
                "• Stress management 🧘\n\n" +
                "What would you like to learn more about?";
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const suggestedQuestions = [
        "What foods should I avoid?",
        "Best exercises for diabetes",
        "How to manage medication",
        "Common symptoms to watch",
        "Blood sugar target ranges",
        "Stress reduction tips",
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI Health Coach</h1>
                    <p className="text-gray-600">Your personal AI assistant for diabetes management</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`btn-secondary flex items-center space-x-2 ${activeTab === 'chat' ? 'bg-primary-600 text-white' : ''}`}
                    >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        <span>Chat</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('diet')}
                        className={`btn-secondary flex items-center space-x-2 ${activeTab === 'diet' ? 'bg-primary-600 text-white' : ''}`}
                    >
                        <LightBulbIcon className="w-5 h-5" />
                        <span>Diet Planner</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('medications')}
                        className={`btn-secondary flex items-center space-x-2 ${activeTab === 'medications' ? 'bg-primary-600 text-white' : ''}`}
                    >
                        <BeakerIcon className="w-5 h-5" />
                        <span>Medications</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('symptoms')}
                        className={`btn-secondary flex items-center space-x-2 ${activeTab === 'symptoms' ? 'bg-primary-600 text-white' : ''}`}
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>Symptom Checker</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden"
            >
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-[600px]">
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-white font-semibold">AI Health Coach</h2>
                                    <p className="text-primary-100 text-sm">Online • Ready to help</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${message.type === 'user'
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                            <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-200' : 'text-gray-500'
                                                }`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-gray-100 rounded-lg p-3">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setInputMessage(question);
                                            handleSendMessage();
                                        }}
                                        className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex space-x-3">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything about diabetes management..."
                                    className="flex-1 input-field resize-none"
                                    rows="2"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || loading}
                                    className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Press Enter to send, Shift+Enter for new line
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'diet' && <DietPlanner />}
                {activeTab === 'medications' && <MedicationTracker />}
                {activeTab === 'symptoms' && <SymptomChecker />}
            </motion.div>
        </div>
    );
};

// Placeholder components for other tabs
const DietPlanner = () => (
    <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Diet Planner</h2>
        <p className="text-gray-600">Coming soon...</p>
    </div>
);

const MedicationTracker = () => (
    <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Medication Tracker</h2>
        <p className="text-gray-600">Coming soon...</p>
    </div>
);

const SymptomChecker = () => (
    <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Symptom Checker</h2>
        <p className="text-gray-600">Coming soon...</p>
    </div>
);

export default ChatInterface;