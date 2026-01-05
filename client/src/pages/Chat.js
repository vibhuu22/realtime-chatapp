
import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket';
import { messagesAPI, userAPI } from '../services/api';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import './Chat.css';

function Chat() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Connect to WebSocket
    socketService.connect(token).then(() => {
      console.log('Connected to chat server');
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to connect:', err);
      setLoading(false);
    });

    // Listen for incoming messages
    socketService.onMessageReceive((data) => {
      setMessages(prev => [...prev, {
        id: data.id,
        sender_id: data.senderId,
        sender_username: data.senderUsername,
        content: data.content,
        sent_at: data.sentAt,
        isReceived: true
      }]);
    });

    // Listen for user status changes
    socketService.onUserOnline((data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    socketService.onUserOffline((data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token, navigate]);

  const loadMessageHistory = async (userId) => {
    try {
      const response = await messagesAPI.getHistory(userId);
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleUserSelect = async (selectedUser) => {
    setSelectedUser(selectedUser);
    await loadMessageHistory(selectedUser.id);
  };

  const handleSendMessage = (content) => {
    if (!selectedUser) return;
    
    socketService.sendMessage(selectedUser.id, content);
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender_id: user.id,
      sender_username: user.username,
      content,
      sent_at: new Date().toISOString(),
      isSent: true
    }]);
  };

  const handleLogout = () => {
    socketService.disconnect();
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Connecting to chat server...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>💬 Chat App</h2>
          <div className="user-info">
            <span>{user.username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
        <UserList 
          currentUserId={user.id}
          onUserSelect={handleUserSelect}
          selectedUserId={selectedUser?.id}
          onlineUsers={onlineUsers}
        />
      </div>
      
      <div className="chat-main">
        {selectedUser ? (
          <ChatWindow
            selectedUser={selectedUser}
            messages={messages}
            currentUserId={user.id}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="no-chat-selected">
            <h3>Select a user to start chatting</h3>
            <p>Choose someone from the user list to begin a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
