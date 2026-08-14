import axios from 'axios';

// Backend API URL (adjust if your backend runs on different port)
const API_URL = 'http://localhost:5000/api/auth';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to every request if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Register user
export const register = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        if (response.data.data) {
            // Store tokens in localStorage
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Login user
export const login = async (credentials) => {
    try {
        const response = await api.post('/login', credentials);
        if (response.data.data) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Logout user
export const logout = async () => {
    try {
        await api.post('/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};

// Get current user
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('accessToken');
    return !!token; // Returns true if token exists
};

// Get stored user info
export const getUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Refresh token
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/refresh', { refreshToken });
        if (response.data.data) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        return response.data;
    } catch (error) {
        // If refresh fails, logout
        await logout();
        throw error;
    }
};