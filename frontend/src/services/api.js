import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect on 401 if we're not already on login/signup
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/signup') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updateEmailPreferences: (data) => api.put('/auth/email-preferences', data),
    sendTestEmail: () => api.post('/auth/send-test-email'),
    sendSummaryNow: () => api.post('/auth/send-summary'),
};

// Transaction API
export const transactionAPI = {
    getAll: () => api.get('/transactions'),
    create: (data) => api.post('/transactions', data),
    update: (id, data) => api.put(`/transactions/${id}`, data),
    delete: (id) => api.delete(`/transactions/${id}`),
};

// Receipt API
export const receiptAPI = {
    getAll: () => api.get('/receipts'),
    create: (data) => api.post('/receipts', data),
    update: (id, data) => api.put(`/receipts/${id}`, data),
    delete: (id) => api.delete(`/receipts/${id}`),
};

// Reminder API
export const reminderAPI = {
    getAll: () => api.get('/reminders'),
    create: (data) => api.post('/reminders', data),
    update: (id, data) => api.put(`/reminders/${id}`, data),
    delete: (id) => api.delete(`/reminders/${id}`),
    markComplete: (id) => api.put(`/reminders/${id}/complete`),
};

// Task API
export const taskAPI = {
    getAll: () => api.get('/tasks'),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
    toggleComplete: (id) => api.put(`/tasks/${id}/toggle`),
};

// Telegram API
export const telegramAPI = {
    getStatus: () => api.get('/telegram/status'),
    link: (data) => api.post('/telegram/link', data),
    unlink: () => api.post('/telegram/unlink'),
    test: () => api.post('/telegram/test'),
};

export default api;
