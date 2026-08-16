import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';
import api from '../services/authService';

const Profile = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        role: ''
    });

    // Form state for updates
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Fetch user data on load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getCurrentUser();
                if (response.success) {
                    setUserData(response.data);
                    setFormData({
                        firstName: response.data.first_name || '',
                        lastName: response.data.last_name || '',
                        email: response.data.email || '',
                        password: '',
                        confirmPassword: ''
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        // Validate password match if changing password
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Prepare update data (only include fields that have values)
        const updateData = {};
        if (formData.firstName !== userData.first_name) {
            updateData.firstName = formData.firstName;
        }
        if (formData.lastName !== userData.last_name) {
            updateData.lastName = formData.lastName;
        }
        if (formData.email !== userData.email) {
            updateData.email = formData.email;
        }
        if (formData.password) {
            updateData.password = formData.password;
        }

        // If nothing to update
        if (Object.keys(updateData).length === 0) {
            setError('No changes to update');
            setLoading(false);
            return;
        }

        try {
            const response = await api.put('/profile', updateData);
            if (response.data.success) {
                setMessage('Profile updated successfully!');
                
                // Update user data
                setUserData(prev => ({
                    ...prev,
                    ...response.data.data
                }));
                
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: ''
                }));

                // Update local storage user info
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    ...response.data.data
                }));

                // Refresh user data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8 mx-auto">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">
                                <i className="bi bi-person-gear me-2"></i>
                                Profile Settings
                            </h4>
                        </div>
                        <div className="card-body">
                            {/* Success/Error Messages */}
                            {message && (
                                <div className="alert alert-success alert-dismissible fade show">
                                    <i className="bi bi-check-circle me-2"></i>
                                    {message}
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setMessage('')}
                                    ></button>
                                </div>
                            )}
                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setError('')}
                                    ></button>
                                </div>
                            )}

                            {/* Current User Info */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <h6 className="card-subtitle text-muted">Username</h6>
                                            <p className="card-text fw-bold">{userData.username}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <h6 className="card-subtitle text-muted">Role</h6>
                                            <p className="card-text">
                                                <span className="badge bg-info">{userData.role || 'User'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Update Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="firstName" className="form-label">
                                            <i className="bi bi-person me-1"></i>
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="lastName" className="form-label">
                                            <i className="bi bi-person me-1"></i>
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        <i className="bi bi-envelope me-1"></i>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <hr className="my-4" />

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        <i className="bi bi-lock me-1"></i>
                                        New Password (leave blank to keep current)
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                    />
                                    <small className="text-muted">
                                        Password must be at least 8 characters
                                    </small>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        <i className="bi bi-lock-fill me-1"></i>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-save me-2"></i>
                                                Update Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
