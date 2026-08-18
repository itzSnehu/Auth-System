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


// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle rate limiting (429)
        if (error.response?.status === 429) {
            const retryAfter = error.response?.headers?.['retry-after'] || 60;
            error.message = `Too many attempts. Please wait ${retryAfter} seconds.`;
            return Promise.reject(error);
        }
        
        // Handle token expiration (401)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await api.post('/refresh', { refreshToken });
                
                if (response.data.success) {
                    localStorage.setItem('accessToken', response.data.data.accessToken);
                    localStorage.setItem('refreshToken', response.data.data.refreshToken);
                    
                    originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
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


// Update profile
export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/profile', userData);
        if (response.data.success) {
            // Update stored user data
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...storedUser,
                ...response.data.data
            }));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ============================================
// EMAIL VERIFICATION ENDPOINTS
// ============================================

// Verify email
export const verifyEmail = async (token) => {
    try {
        const response = await api.get(`/verify-email?token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Resend verification email
export const resendVerificationEmail = async () => {
    try {
        const response = await api.post('/resend-verification');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ============================================
// PASSWORD RESET ENDPOINTS
// ============================================

// Request password reset
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post('/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post('/reset-password', { token, newPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Validate reset token
export const validateResetToken = async (token) => {
    try {
        const response = await api.get(`/validate-reset-token?token=${token}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;