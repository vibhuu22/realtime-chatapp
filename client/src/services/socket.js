
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket');
        resolve();
      });

      this.socket.on('connect_error', (err) => {
        console.error('❌ Connection error:', err.message);
        reject(err);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send message
  sendMessage(receiverId, content) {
    this.socket.emit('message:send', {
      receiverId,
      content,
      tempId: Date.now()
    });
  }

  // Listen for messages
  onMessageReceive(callback) {
    this.socket.on('message:receive', callback);
  }

  onMessageSent(callback) {
    this.socket.on('message:sent', callback);
  }

  // User status
  onUserOnline(callback) {
    this.socket.on('user:online', callback);
  }

  onUserOffline(callback) {
    this.socket.on('user:offline', callback);
  }

  // Typing indicators
  startTyping(receiverId) {
    this.socket.emit('typing:start', { receiverId });
  }

  stopTyping(receiverId) {
    this.socket.emit('typing:stop', { receiverId });
  }

  onTypingStart(callback) {
    this.socket.on('typing:start', callback);
  }

  onTypingStop(callback) {
    this.socket.on('typing:stop', callback);
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
