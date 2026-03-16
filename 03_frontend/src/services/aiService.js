// src/services/aiService.js
import api from './api';

class AIService {
    async sendChatMessage(message) {
        try {
            console.log('📤 Sending chat message:', message);
            const response = await api.post('/ai/chat/', { message });
            console.log('📥 Chat response:', response);

            // Handle different response formats
            if (!response || !response.data) {
                throw new Error('No data received from server');
            }

            const data = response.data;

            // Check if we got a valid response
            if (data.success) {
                // If response exists and is not null
                if (data.response && data.response !== null) {
                    return {
                        success: true,
                        response: data.response,
                        model: data.model || 'AI Model',
                        usage: data.usage,
                        timestamp: data.timestamp || new Date().toISOString()
                    };
                }
                // If response is null but we have other fields
                else if (data.message) {
                    return {
                        success: true,
                        response: data.message,
                        model: data.model || 'AI Model',
                        usage: data.usage,
                        timestamp: data.timestamp || new Date().toISOString()
                    };
                } else if (data.analysis) {
                    return {
                        success: true,
                        response: data.analysis,
                        model: data.model || 'AI Model',
                        usage: data.usage,
                        timestamp: data.timestamp || new Date().toISOString()
                    };
                } else if (data.text) {
                    return {
                        success: true,
                        response: data.text,
                        model: data.model || 'AI Model',
                        usage: data.usage,
                        timestamp: data.timestamp || new Date().toISOString()
                    };
                } else {
                    // If no text field found but success is true, return the data as is
                    return {
                        success: true,
                        response: data,
                        model: data.model || 'AI Model',
                        usage: data.usage,
                        timestamp: data.timestamp || new Date().toISOString()
                    };
                }
            } else if (data.response) {
                return {
                    success: true,
                    response: data.response,
                    model: data.model || 'AI Model',
                    usage: data.usage,
                    timestamp: data.timestamp || new Date().toISOString()
                };
            } else if (data.message) {
                return {
                    success: true,
                    response: data.message,
                    model: data.model || 'AI Model',
                    usage: data.usage,
                    timestamp: data.timestamp || new Date().toISOString()
                };
            } else if (typeof data === 'string') {
                return {
                    success: true,
                    response: data,
                    model: 'AI Model',
                    usage: null,
                    timestamp: new Date().toISOString()
                };
            } else if (data.analysis) {
                return {
                    success: true,
                    response: data.analysis,
                    model: data.model || 'AI Model',
                    usage: data.usage,
                    timestamp: data.timestamp || new Date().toISOString()
                };
            } else {
                console.warn('Unexpected response format:', data);

                // Try to extract any meaningful text
                const possibleTextFields = ['response', 'message', 'text', 'content', 'analysis', 'reply', 'answer'];
                for (const field of possibleTextFields) {
                    if (data[field] && typeof data[field] === 'string') {
                        return {
                            success: true,
                            response: data[field],
                            model: data.model || 'AI Model',
                            usage: data.usage,
                            timestamp: data.timestamp || new Date().toISOString()
                        };
                    }
                }

                // If no text field found, return the whole object as string
                return {
                    success: true,
                    response: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data),
                    model: 'AI Model',
                    usage: null,
                    timestamp: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('❌ Chat error:', error);

            // Provide user-friendly error message
            let errorMessage = 'Failed to send message';
            if (error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }

    // Alias for backward compatibility
    async sendMessage(message) {
        return this.sendChatMessage(message);
    }

    async getChatHistory() {
        try {
            console.log('📤 Fetching chat history');
            const response = await api.get('/ai/chat/history/');
            console.log('📥 Chat history response:', response);

            if (!response || !response.data) {
                return { success: true, history: [] };
            }

            const data = response.data;

            // Handle different response formats
            if (data.history) {
                return {
                    success: true,
                    history: data.history
                };
            } else if (Array.isArray(data)) {
                return {
                    success: true,
                    history: data
                };
            } else if (data.results) {
                return {
                    success: true,
                    history: data.results
                };
            } else {
                return {
                    success: true,
                    history: []
                };
            }
        } catch (error) {
            console.error('❌ Get chat history error:', error);
            // Return empty history on error
            return { success: true, history: [] };
        }
    }

    async generateMealPlan(preferences) {
        try {
            console.log('📤 Generating meal plan with preferences:', preferences);
            const response = await api.post('/ai/meal-plan/', { preferences });

            if (!response || !response.data) {
                throw new Error('No data received from server');
            }

            return response.data;
        } catch (error) {
            console.error('❌ Meal plan error:', error);
            throw error;
        }
    }

    async analyzeSymptoms(symptoms, duration) {
        try {
            console.log('📤 Analyzing symptoms:', { symptoms, duration });

            // Convert symptoms array to string if needed
            const symptomsText = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

            const response = await api.post('/ai/analyze-symptoms/', {
                symptoms: symptomsText,
                duration: duration || 'not specified'
            });

            console.log('📥 Raw API response:', response);

            // Handle different response formats
            if (!response || !response.data) {
                throw new Error('No data received from server');
            }

            const data = response.data;

            // Check for different possible response structures
            if (data.analysis) {
                return {
                    success: true,
                    analysis: data.analysis,
                    disclaimer: data.disclaimer || "⚠️ This is AI-generated information and NOT medical advice. Always consult a healthcare professional for proper diagnosis and treatment.",
                    model: data.model || 'AI Model',
                    recommendations: data.recommendations || [],
                    urgency: data.urgency || 'non-urgent'
                };
            } else if (data.response) {
                return {
                    success: true,
                    analysis: data.response,
                    disclaimer: data.disclaimer || "⚠️ This is AI-generated information and NOT medical advice.",
                    model: data.model || 'AI Model',
                    recommendations: data.recommendations || []
                };
            } else if (typeof data === 'string') {
                return {
                    success: true,
                    analysis: data,
                    disclaimer: "⚠️ This is AI-generated information and NOT medical advice. Always consult a healthcare professional for proper diagnosis and treatment.",
                    model: 'AI Model'
                };
            } else if (data.message) {
                return {
                    success: true,
                    analysis: data.message,
                    disclaimer: data.disclaimer || "⚠️ This is AI-generated information and NOT medical advice.",
                    model: data.model || 'AI Model'
                };
            } else {
                console.warn('Unknown response format:', data);
                return {
                    success: true,
                    analysis: typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data),
                    disclaimer: "⚠️ This is AI-generated information and NOT medical advice.",
                    model: 'AI Model'
                };
            }
        } catch (error) {
            console.error('❌ Symptom analysis error:', error);

            // Provide a user-friendly error message
            let errorMessage = 'Failed to analyze symptoms';
            if (error.response) {
                errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else {
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    }

    // Test method to check AI connection
    async testAIConnection() {
        try {
            console.log('🔍 Testing AI connection...');
            const response = await api.post('/ai/chat/', {
                message: 'Hello, this is a test message. Please respond with a simple greeting.'
            });

            console.log('📥 Test response:', response);

            if (!response || !response.data) {
                return {
                    success: false,
                    message: 'No response from server',
                    details: response
                };
            }

            const data = response.data;

            return {
                success: true,
                message: 'AI service is responding',
                hasResponse: !!(data.response || data.message || data.analysis),
                responseData: data,
                model: data.model,
                usage: data.usage
            };
        } catch (error) {
            console.error('❌ AI connection test failed:', error);
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }
}

// Create and export a single instance
const aiService = new AIService();
export default aiService;