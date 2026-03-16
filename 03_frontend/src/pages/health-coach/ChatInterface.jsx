// src/pages/health-coach/ChatInterface.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PaperAirplaneIcon,
    SparklesIcon,
    UserCircleIcon,
    ChatBubbleLeftRightIcon,
    MicrophoneIcon,
    StopIcon,
    ClockIcon,
    BeakerIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ChatInterface = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [showDebug, setShowDebug] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Suggested questions
    const suggestedQuestions = [
        "What foods should I avoid with diabetes?",
        "Give me a tip to lower blood sugar",
        "What's a healthy breakfast?",
        "How can I exercise safely with diabetes?",
        "What symptoms should I watch for?",
    ];

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load chat history on mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await aiService.getChatHistory();
            console.log('📥 Chat history response:', response);

            if (response && response.success) {
                if (Array.isArray(response.history) && response.history.length > 0) {
                    // Convert history to message format
                    const historyMessages = response.history.flatMap(item => [
                        {
                            id: `user-${item.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            text: item.message,
                            sender: 'user',
                            timestamp: item.created_at || new Date().toISOString(),
                        },
                        {
                            id: `ai-${item.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            text: item.response,
                            sender: 'ai',
                            timestamp: item.created_at || new Date().toISOString(),
                            model: item.model_used,
                        }
                    ]);
                    setMessages(historyMessages);
                } else {
                    setMessages([]);
                }
            } else {
                console.log('No chat history found');
                setMessages([]);
            }
        } catch (error) {
            console.error('❌ Failed to load chat history:', error);
            toast.error('Failed to load chat history');
            setMessages([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const testConnection = async () => {
        try {
            toast.loading('Testing AI connection...', { id: 'ai-test' });
            const result = await aiService.testAIConnection();
            console.log('🔍 AI Test Result:', result);

            if (result.success) {
                if (result.hasResponse) {
                    toast.success(
                        `✅ AI service is working!\nModel: ${result.model || 'Unknown'}`,
                        { id: 'ai-test', duration: 5000 }
                    );
                } else {
                    toast.error(
                        `⚠️ AI responded but no content returned.\nCheck server configuration.`,
                        { id: 'ai-test', duration: 5000 }
                    );
                }
            } else {
                toast.error(
                    `❌ AI test failed: ${result.message}`,
                    { id: 'ai-test', duration: 5000 }
                );
            }
        } catch (error) {
            toast.error('Test failed: ' + error.message, { id: 'ai-test' });
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Add user message
        const userMessage = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMessage]);

        const sentMessage = inputMessage;
        setInputMessage('');
        setIsLoading(true);

        try {
            console.log('📤 Sending message:', sentMessage);

            const response = await aiService.sendChatMessage(sentMessage);
            console.log('📥 Received response:', response);

            // Check if response exists
            if (!response) {
                console.error('Response is null or undefined');
                throw new Error('No response from server');
            }

            let aiResponseText = '';
            let modelInfo = 'AI Model';

            // Handle different response formats
            if (response.success) {
                // Case 1: response.response exists and is not null
                if (response.response && response.response !== null) {
                    // Check if response.response is an object or string
                    if (typeof response.response === 'object') {
                        aiResponseText = JSON.stringify(response.response, null, 2);
                    } else {
                        aiResponseText = response.response;
                    }
                    modelInfo = response.model || 'AI Model';
                }
                // Case 2: response.response is null but we have other fields
                else if (response.message) {
                    aiResponseText = response.message;
                    modelInfo = response.model || 'AI Model';
                }
                else if (response.analysis) {
                    aiResponseText = response.analysis;
                    modelInfo = response.model || 'AI Model';
                }
                else if (response.text) {
                    aiResponseText = response.text;
                    modelInfo = response.model || 'AI Model';
                }
                else {
                    // If we have no text fields but success is true, show raw data
                    console.warn('Response with no text fields:', response);
                    aiResponseText = "I received your message but couldn't generate a proper response. The AI service might be experiencing issues.\n\n" +
                        "Please try:\n" +
                        "• Refreshing the page\n" +
                        "• Checking your internet connection\n" +
                        "• Trying again in a few moments\n\n" +
                        "If the problem persists, please contact support.";
                    modelInfo = response.model || 'System';
                }
            }
            // Handle direct string response
            else if (typeof response === 'string') {
                aiResponseText = response;
            }
            // Handle error response
            else if (response.error) {
                throw new Error(response.error);
            }
            // Handle unknown format
            else {
                console.warn('Unexpected response format:', response);
                aiResponseText = "I received an unexpected response format. Please try again or contact support.";
            }

            // Create AI message with the extracted text
            const aiMessage = {
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                text: aiResponseText,
                sender: 'ai',
                timestamp: response.timestamp || new Date().toISOString(),
                model: response.model || modelInfo,
                usage: response.usage // Include usage info if available
            };

            setMessages(prev => [...prev, aiMessage]);

            // Log token usage if available (useful for debugging)
            if (response.usage) {
                console.log('📊 Token usage:', response.usage);
            }

        } catch (error) {
            console.error('❌ Send message error:', error);

            // Show user-friendly error message
            let errorMessage = error.message || "I'm having trouble connecting. Please try again later.";

            // Check for specific error types
            if (errorMessage.includes('401')) {
                errorMessage = 'Please log in to use the chat feature.';
            } else if (errorMessage.includes('429')) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (errorMessage.includes('500')) {
                errorMessage = 'Server error. The AI service might be temporarily unavailable.';
            }

            toast.error(errorMessage);

            // Add error message to chat
            setMessages(prev => [...prev, {
                id: `ai-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                text: errorMessage + "\n\nPlease try again in a few moments. If the issue persists, contact support.",
                sender: 'ai',
                timestamp: new Date().toISOString(),
                isError: true,
                model: 'System',
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleVoiceInput = () => {
        if (!isRecording) {
            // Check if browser supports speech recognition
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();

                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-US';

                recognition.onstart = () => {
                    setIsRecording(true);
                    toast.loading('Listening...', { id: 'voice' });
                };

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setInputMessage(transcript);
                    setIsRecording(false);
                    toast.success('Voice captured!', { id: 'voice' });
                };

                recognition.onerror = (event) => {
                    console.error('Voice recognition error:', event.error);
                    setIsRecording(false);

                    let errorMessage = 'Voice recognition failed.';
                    if (event.error === 'not-allowed') {
                        errorMessage = 'Microphone access denied. Please allow microphone access.';
                    } else if (event.error === 'no-speech') {
                        errorMessage = 'No speech detected. Please try again.';
                    }

                    toast.error(errorMessage, { id: 'voice' });
                };

                recognition.onend = () => {
                    setIsRecording(false);
                    toast.dismiss('voice');
                };

                recognition.start();
            } else {
                toast.error('Voice input is not supported in your browser. Try Chrome or Edge.');
            }
        } else {
            setIsRecording(false);
            toast.dismiss('voice');
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.timestamp);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    if (loadingHistory) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">AI Health Coach</h2>
                        <p className="text-sm text-white/80">Ask me anything about your health</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
                            AI Powered
                        </div>
                        {/* Debug button - only in development */}
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                onClick={testConnection}
                                className="bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full text-xs transition-colors flex items-center gap-1"
                                title="Test AI Connection"
                            >
                                <BeakerIcon className="w-3 h-3" />
                                Debug
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ChatBubbleLeftRightIcon className="w-10 h-10 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Welcome to Your AI Health Coach
                            </h3>
                            <p className="text-gray-500 mb-6">
                                I'm here to help you understand your health, suggest lifestyle changes,
                                and answer your questions about diabetes prevention.
                            </p>

                            {/* Suggested Questions */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Try asking:</p>
                                {suggestedQuestions.map((question, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => {
                                            setInputMessage(question);
                                            setTimeout(() => sendMessage(), 100);
                                        }}
                                        className="w-full p-3 text-left text-sm bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
                                    >
                                        <span className="text-gray-700">{question}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                            <div key={date} className="space-y-4">
                                {/* Date Separator */}
                                <div className="flex justify-center">
                                    <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                        {date}
                                    </span>
                                </div>

                                {/* Messages for this date */}
                                {dateMessages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                            {/* Avatar */}
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user'
                                                ? 'bg-primary-100'
                                                : message.isError
                                                    ? 'bg-red-100'
                                                    : 'bg-gradient-to-br from-primary-500 to-primary-600'
                                                }`}>
                                                {message.sender === 'user' ? (
                                                    <UserCircleIcon className="w-5 h-5 text-primary-600" />
                                                ) : message.isError ? (
                                                    <span className="text-red-600">⚠️</span>
                                                ) : (
                                                    <SparklesIcon className="w-4 h-4 text-white" />
                                                )}
                                            </div>

                                            {/* Message Content */}
                                            <div>
                                                <div className={`rounded-2xl p-4 ${message.sender === 'user'
                                                    ? 'bg-primary-600 text-white'
                                                    : message.isError
                                                        ? 'bg-red-50 border border-red-200 text-red-800'
                                                        : 'bg-white border border-gray-200 shadow-sm text-gray-800'
                                                    }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center gap-2 mt-1 px-2">
                                                    <ClockIcon className="w-3 h-3 text-gray-400" />
                                                    <p className="text-xs text-gray-400">
                                                        {formatTime(message.timestamp)}
                                                    </p>
                                                    {message.model && !message.isError && message.sender === 'ai' && (
                                                        <p className="text-xs text-gray-400 ml-auto">
                                                            {typeof message.model === 'string' ? message.model.split('/').pop() : 'AI'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                <SparklesIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl p-4">
                                <LoadingSpinner size="sm" />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask your health coach..."
                            rows="1"
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none resize-none"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                            disabled={isLoading}
                        />

                        {/* Voice input button */}
                        <button
                            onClick={handleVoiceInput}
                            disabled={isLoading}
                            className={`absolute right-3 bottom-2.5 p-1.5 rounded-lg transition-colors ${isRecording
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isRecording ? 'Stop recording' : 'Start voice input'}
                        >
                            {isRecording ? (
                                <StopIcon className="w-5 h-5" />
                            ) : (
                                <MicrophoneIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Send message"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Context badges */}
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <span>AI Health Coach •</span>
                    <span>Personalized advice •</span>
                    <span>Always consult your doctor</span>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;