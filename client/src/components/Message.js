
import React from 'react';
import './Message.css';

function Message({ message, isOwn }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message ${isOwn ? 'message-own' : 'message-other'}`}>
      <div className="message-content">
        {!isOwn && (
          <div className="message-sender">{message.sender_username}</div>
        )}
        <div className="message-text">{message.content}</div>
        <div className="message-time">{formatTime(message.sent_at)}</div>
      </div>
    </div>
  );
}

export default Message;
