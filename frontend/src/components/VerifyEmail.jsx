import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../services/authService';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resendMessage, setResendMessage] = useState('');

    useEffect(() => {
        if (token) {
            verifyEmailToken(token);
        } else {
            setError('No verification token provided');
            setLoading(false);
        }
    }, [token]);

    const verifyEmailToken = async (token) => {
        setVerifying(true);
        try {
            const response = await verifyEmail(token);
            if (response.success) {
                setSuccess(true);
                // Update user in localStorage if logged in
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.id) {
                    user.isVerified = true;
                    localStorage.setItem('user', JSON.stringify(user));
                }
                setTimeout(() => {
                    navigate('/login?verified=true');
                }, 3000);
            }
        } catch (error) {
            setError(error.message || 'Email verification failed');
        } finally {
            setLoading(false);
            setVerifying(false);
        }
    };

    const handleResendVerification = async () => {
        setResendMessage('');
        try {
            const response = await resendVerificationEmail();
            setResendMessage('Verification email resent successfully!');
        } catch (error) {
            setResendMessage(error.message || 'Failed to resend verification email');
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Verifying your email...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white text-center">
                            <h4 className="mb-0">Email Verification</h4>
                        </div>
                        <div className="card-body text-center p-4">
                            {success ? (
                                <>
                                    <div className="text-success">
                                        <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h3 className="mt-3">Email Verified!</h3>
                                    <p className="text-muted">
                                        Your email has been successfully verified.
                                    </p>
                                    <p className="text-muted small">
                                        Redirecting to login...
                                    </p>
                                    <Link to="/login" className="btn btn-primary mt-3">
                                        Go to Login
                                    </Link>
                                </>
                            ) : error ? (
                                <>
                                    <div className="text-danger">
                                        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h3 className="mt-3">Verification Failed</h3>
                                    <p className="text-danger">{error}</p>
                                    {error.includes('expired') && (
                                        <button 
                                            className="btn btn-primary mt-3"
                                            onClick={handleResendVerification}
                                            disabled={verifying}
                                        >
                                            {verifying ? (
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                            ) : null}
                                            Resend Verification Email
                                        </button>
                                    )}
                                    {resendMessage && (
                                        <div className={`alert ${resendMessage.includes('successfully') ? 'alert-success' : 'alert-danger'} mt-3`}>
                                            {resendMessage}
                                        </div>
                                    )}
                                    <Link to="/login" className="btn btn-outline-secondary mt-3 ms-2">
                                        Back to Login
                                    </Link>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;