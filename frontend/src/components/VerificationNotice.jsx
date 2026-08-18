import React, { useState } from 'react';
import { resendVerificationEmail } from '../services/authService';

const VerificationNotice = ({ onVerified }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleResend = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await resendVerificationEmail();
            setMessage('Verification email sent successfully! Please check your inbox.');
            if (onVerified) onVerified();
        } catch (error) {
            setMessage(error.message || 'Failed to resend verification email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="alert alert-warning">
            <div className="d-flex align-items-start">
                <i className="bi bi-envelope-exclamation me-3" style={{ fontSize: '1.5rem' }}></i>
                <div>
                    <h5 className="alert-heading">Email Not Verified</h5>
                    <p className="mb-2">
                        Please verify your email address to access all features.
                        Check your inbox for the verification link.
                    </p>
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={handleResend}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                            <i className="bi bi-envelope me-2"></i>
                        )}
                        Resend Verification Email
                    </button>
                    {message && (
                        <div className={`mt-2 alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} py-2`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerificationNotice;