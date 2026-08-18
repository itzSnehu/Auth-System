import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerService } from '../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const { register: setAuthUser } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    });
    
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear errors when user types
        setErrors([]);
    };

    // Validate form before submission
    const validateForm = () => {
        const newErrors = [];
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.push('Passwords do not match');
        }
        
        if (formData.password.length < 8) {
            newErrors.push('Password must be at least 8 characters');
        }
        
        return newErrors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        setErrors([]);
        setSuccessMessage('');

        try {
            const { confirmPassword, ...userData } = formData;
            const response = await registerService(userData);
            
            if (response.success) {
                setAuthUser(response.data.user);
                 // ✅ Show verification message
                    if (response.data.requiresEmailVerification) {
                        setSuccessMessage(
                            'Registration successful! Please check your email to verify your account.'
                        );
                        // Don't redirect immediately - show message
                    } else {
                        setSuccessMessage('Registration successful! Redirecting...');
                        setTimeout(() => navigate('/'), 2000);
                    }
            }
        } catch (error) {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                setErrors([error.message || 'Registration failed. Please try again.']);
            }
        } finally {
            setLoading(false);
        }
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-primary text-white text-center py-3">
                            <h3 className="mb-0">
                                <i className="bi bi-person-plus me-2"></i>
                                Create Account
                            </h3>
                            <p className="mb-0 small">Join us today!</p>
                        </div>
                        <div className="card-body p-4">
                            {/* Success Message */}
                            {successMessage && (
                                <div className="alert alert-success d-flex align-items-center" role="alert">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    <div>{successMessage}</div>
                                </div>
                            )}

                            {/* Error Messages */}
                            {errors.length > 0 && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <strong>Please fix the following errors:</strong>
                                    <ul className="mb-0 mt-2">
                                        {errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Username Field */}
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label fw-bold">
                                        <i className="bi bi-person me-1"></i>
                                        Username *
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-at"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.some(e => e.includes('username')) ? 'is-invalid' : ''}`}
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            placeholder="Choose a username"
                                            minLength={3}
                                            maxLength={20}
                                        />
                                    </div>
                                    <small className="text-muted">
                                        <i className="bi bi-info-circle"></i> 3-20 characters, letters, numbers, underscores only
                                    </small>
                                </div>

                                {/* Email Field */}
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-bold">
                                        <i className="bi bi-envelope me-1"></i>
                                        Email Address *
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-envelope"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label fw-bold">
                                        <i className="bi bi-lock me-1"></i>
                                        Password *
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-key"></i>
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            placeholder="Create a password"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={togglePasswordVisibility}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    <small className="text-muted">
                                        <i className="bi bi-shield-check"></i> At least 8 characters, 1 uppercase, 1 lowercase, 1 number
                                    </small>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label fw-bold">
                                        <i className="bi bi-lock-fill me-1"></i>
                                        Confirm Password *
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-check-circle"></i>
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="Confirm your password"
                                        />
                                    </div>
                                </div>

                                {/* Name Fields Row */}
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="firstName" className="form-label">
                                            <i className="bi bi-person-badge me-1"></i>
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="First name"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lastName" className="form-label">
                                            <i className="bi bi-person-badge me-1"></i>
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-person-plus me-2"></i>
                                            Register
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Login Link */}
                            <div className="mt-4 text-center">
                                <p className="text-muted">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-primary fw-bold text-decoration-none">
                                        Login here <i className="bi bi-arrow-right"></i>
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;