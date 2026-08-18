import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword, validateResetToken } from '../services/authService';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('No reset token provided');
            setValidating(false);
            return;
        }

        const validateToken = async () => {
            try {
                await validateResetToken(token);
                setIsValidToken(true);
            } catch (error) {
                setError(error.message || 'Invalid or expired reset token');
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await resetPassword(token, password);
            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login?reset=success');
                }, 3000);
            }
        } catch (error) {
            setError(error.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Validating your reset link...</p>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-header bg-danger text-white">
                                <h4 className="mb-0">Invalid Reset Link</h4>
                            </div>
                            <div className="card-body text-center p-4">
                                <div className="text-danger">
                                    <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <h5 className="mt-3">{error}</h5>
                                <p className="text-muted">
                                    The password reset link is invalid or has expired.
                                </p>
                                <Link to="/forgot-password" className="btn btn-primary mt-3">
                                    Request New Link
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-lock me-2"></i>
                                Reset Password
                            </h4>
                        </div>
                        <div className="card-body p-4">
                            {success ? (
                                <div className="text-center">
                                    <div className="text-success">
                                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
                                    </div>
                                    <h5 className="mt-3">Password Reset Successful!</h5>
                                    <p className="text-muted">
                                        Your password has been reset successfully.
                                        Redirecting to login...
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <p className="text-muted">
                                        Enter your new password below.
                                    </p>

                                    {error && (
                                        <div className="alert alert-danger">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter new password"
                                            minLength={8}
                                        />
                                        <small className="text-muted">
                                            Password must be at least 8 characters
                                        </small>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Confirm new password"
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
                                                Resetting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Reset Password
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;