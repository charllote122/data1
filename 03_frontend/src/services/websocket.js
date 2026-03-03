import { io } from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // Initialize WebSocket connection
    connect(token) {
        const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

        this.socket = io(WS_URL, {
            transports: ['websocket'],
            query: { token },
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
        });

        this.setupEventHandlers();
    }

    // Setup socket event handlers
    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.emit('connected', { status: 'connected' });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            this.emit('disconnected', { reason });

            if (reason === 'io server disconnect') {
                // Server disconnected, attempt to reconnect
                this.socket.connect();
            }
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            this.reconnectAttempts = attempt;
            console.log(`Reconnection attempt ${attempt}`);
        });

        this.socket.on('reconnect', () => {
            console.log('WebSocket reconnected');
            this.emit('reconnected');
        });

        this.socket.on('reconnect_failed', () => {
            console.error('WebSocket reconnection failed');
            this.emit('reconnect_failed');
        });

        // Handle specific events
        this.socket.on('prediction_update', (data) => {
            this.emit('prediction_update', data);
        });

        this.socket.on('medication_reminder', (data) => {
            this.emit('medication_reminder', data);
        });

        this.socket.on('achievement_unlocked', (data) => {
            this.emit('achievement_unlocked', data);
        });

        this.socket.on('notification', (data) => {
            this.emit('notification', data);
        });

        this.socket.on('challenge_update', (data) => {
            this.emit('challenge_update', data);
        });

        this.socket.on('goal_progress', (data) => {
            this.emit('goal_progress', data);
        });
    }

    // Add event listener
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    // Remove event listener
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    // Emit event to listeners
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    // Send message to server
    send(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('WebSocket not connected');
        }
    }

    // Join a room
    joinRoom(room) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('join', { room });
        }
    }

    // Leave a room
    leaveRoom(room) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('leave', { room });
        }
    }

    // Check connection status
    isConnected() {
        return this.socket && this.socket.connected;
    }

    // Disconnect WebSocket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    // Reconnect manually
    reconnect() {
        if (this.socket && !this.socket.connected) {
            this.socket.connect();
        }
    }

    // Get connection status
    getStatus() {
        if (!this.socket) return 'disconnected';
        if (this.socket.connected) return 'connected';
        if (this.socket.disconnected) return 'disconnected';
        return 'connecting';
    }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;