import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await requestPasswordReset(email);
            setSuccess(true);
        } catch (error) {
            setError(error.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-key me-2"></i>
                                Forgot Password
                            </h4>
                        </div>
                        <div className="card-body p-4">
                            {success ? (
                                <div className="text-center">
                                    <div className="text-success">
                                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <h5 className="mt-3">Check Your Email</h5>
                                    <p className="text-muted">
                                        We've sent a password reset link to your email address.
                                        Please check your inbox (and spam folder).
                                    </p>
                                    <Link to="/login" className="btn btn-primary mt-3">
                                        Back to Login
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <p className="text-muted">
                                        Enter your email address and we'll send you a link to reset your password.
                                    </p>

                                    {error && (
                                        <div className="alert alert-danger">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-envelope me-2"></i>
                                                Send Reset Link
                                            </>
                                        )}
                                    </button>

                                    <div className="mt-3 text-center">
                                        <Link to="/login" className="text-decoration-none">
                                            <i className="bi bi-arrow-left me-1"></i>
                                            Back to Login
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;