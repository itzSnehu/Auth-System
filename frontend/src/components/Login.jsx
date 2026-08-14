import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const { login: setAuthUser } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { rememberMe, ...credentials } = formData;
            const response = await loginService(credentials);
            
            if (response.success) {
                setAuthUser(response.data.user);
                navigate('/');
            }
        } catch (error) {
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-lg border-0">
                        <div className="card-header bg-primary text-white text-center py-3">
                            <h3 className="mb-0">
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Welcome Back
                            </h3>
                            <p className="mb-0 small">Sign in to continue</p>
                        </div>
                        <div className="card-body p-4">
                            {/* Error Message */}
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <div>{error}</div>
                                </div>
                            )}

                            {/* Demo Credentials Hint (Optional) */}
                            <div className="alert alert-info small">
                                <i className="bi bi-lightbulb me-2"></i>
                                <strong>Demo:</strong> Use any registered account or create one
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Email Field */}
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-bold">
                                        <i className="bi bi-envelope me-1"></i>
                                        Email Address
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
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label fw-bold">
                                        <i className="bi bi-lock me-1"></i>
                                        Password
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
                                            placeholder="Enter your password"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={togglePasswordVisibility}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Remember Me & Forgot Password Row */}
                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="rememberMe">
                                            Remember me
                                        </label>
                                    </div>
                                    <Link to="/forgot-password" className="text-decoration-none small">
                                        Forgot Password?
                                    </Link>
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
                                            Logging in...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Login
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Register Link */}
                            <div className="mt-4 text-center">
                                <p className="text-muted">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-primary fw-bold text-decoration-none">
                                        Create one now <i className="bi bi-arrow-right"></i>
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

export default Login;
