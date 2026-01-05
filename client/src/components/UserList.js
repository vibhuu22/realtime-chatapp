

import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import './UserList.css';

function UserList({ currentUserId, onUserSelect, selectedUserId, onlineUsers }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // For now, we'll manually add some users
    // In a real app, you'd fetch from an endpoint
    const fetchUsers = async () => {
      try {
        // This is a placeholder - you'd typically have a GET /api/users endpoint
        // For MVP, we'll hardcode some sample users
        const sampleUsers = [
          { id: 1, username: 'vibhu_test', first_name: 'Vibhanshu', last_name: 'Test' },
          { id: 2, username: 'alice', first_name: 'Alice', last_name: 'Smith' },
          { id: 3, username: 'vibhu2', first_name: 'Vibhu', last_name: 'C' },
          { id: 4, username: 'vibhu22', first_name: 'Vibhu', last_name: '22' },
        ].filter(u => u.id !== currentUserId);
        
        setUsers(sampleUsers);
        setLoading(false);
      } catch (err) {
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Users</h3>
        <span className="user-count">{users.length} online</span>
      </div>
      
      <div className="user-list-items">
        {users.map(user => (
          <div
            key={user.id}
            className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
            onClick={() => onUserSelect(user)}
          >
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">
                {user.first_name || user.username}
              </div>
              <div className="user-status">
                <span className={`status-indicator ${onlineUsers.has(user.id) ? 'online' : 'offline'}`}></span>
                {onlineUsers.has(user.id) ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;
