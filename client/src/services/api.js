
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';


// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// User API
export const userAPI = {
  getMe: () => api.get('/users/me'),
  getUser: (userId) => api.get(`/users/${userId}`),
};

// Messages API
export const messagesAPI = {
  getHistory: (otherUserId) => api.get(`/messages/history/${otherUserId}`),
  markAsRead: (messageIds) => api.post('/messages/read', { messageIds }),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

export default api;
