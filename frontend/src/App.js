import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Navbar />
                    <div className="content">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/register" element={<Register />} />
                            <Route path="/login" element={<Login />} />
                            
                            {/* Protected Routes */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            } />
                            
                            {/* Catch all - redirect to home */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;