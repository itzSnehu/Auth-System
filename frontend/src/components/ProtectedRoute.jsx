import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isLoggedIn, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    // Redirect to login if not authenticated
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    // Render children if authenticated
    return children;
};

export default ProtectedRoute;
