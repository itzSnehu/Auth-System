import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUser, isAuthenticated, logout as logoutService } from '../services/authService';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in on mount
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            if (authenticated) {
                const userData = getUser();
                setUser(userData);
                setIsLoggedIn(true);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Login function
    const login = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    // Register function (similar to login)
    const register = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    // Logout function
    const logout = async () => {
        await logoutService();
        setUser(null);
        setIsLoggedIn(false);
    };

    const value = {
        user,
        loading,
        isLoggedIn,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};