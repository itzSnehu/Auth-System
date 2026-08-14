import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../services/authService';

const Home = () => {
    const { user, logout } = useAuth();
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProjects: 3,
        tasksCompleted: 12,
        pendingTasks: 5,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getCurrentUser();
                if (response.success) {
                    setUserDetails(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="container mt-4">
            {/* Welcome Banner */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-gradient-primary text-white border-0 shadow">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="mb-0">
                                        <i className="bi bi-hand-thumbs-up me-2"></i>
                                        Welcome back, {user?.firstName || user?.username || 'User'}!
                                    </h2>
                                    <p className="mb-0 opacity-75">
                                        You're logged in and ready to go!
                                    </p>
                                </div>
                                <div className="d-none d-md-block">
                                    <span className="badge bg-light text-primary p-2">
                                        <i className="bi bi-shield-check me-1"></i>
                                        Authenticated
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* User Info Card */}
                <div className="col-md-4 mb-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-person-circle me-2"></i>
                                Profile
                            </h5>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-center mb-3">
                                        <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                                             style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                            <i className="bi bi-person"></i>
                                        </div>
                                    </div>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span className="text-muted">Username</span>
                                            <span className="fw-bold">{userDetails?.username || user?.username}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span className="text-muted">Email</span>
                                            <span className="fw-bold">{userDetails?.email || user?.email}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span className="text-muted">Name</span>
                                            <span className="fw-bold">
                                                {userDetails?.first_name || ''} {userDetails?.last_name || ''}
                                            </span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span className="text-muted">Role</span>
                                            <span className="badge bg-info">{userDetails?.role || 'User'}</span>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <span className="text-muted">Status</span>
                                            <span className={`badge ${userDetails?.is_active ? 'bg-success' : 'bg-danger'}`}>
                                                {userDetails?.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="col-md-8">
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="text-primary mb-2">
                                        <i className="bi bi-folder" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <h3 className="fw-bold">{stats.totalProjects}</h3>
                                    <p className="text-muted mb-0">Total Projects</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="text-success mb-2">
                                        <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <h3 className="fw-bold">{stats.tasksCompleted}</h3>
                                    <p className="text-muted mb-0">Tasks Completed</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 mb-4">
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body text-center">
                                    <div className="text-warning mb-2">
                                        <i className="bi bi-clock-history" style={{ fontSize: '2rem' }}></i>
                                    </div>
                                    <h3 className="fw-bold">{stats.pendingTasks}</h3>
                                    <p className="text-muted mb-0">Pending Tasks</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">
                                <i className="bi bi-activity me-2"></i>
                                Recent Activity
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="timeline">
                                <div className="d-flex mb-3">
                                    <div className="me-3">
                                        <span className="badge bg-success rounded-circle p-2">
                                            <i className="bi bi-check2"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <p className="mb-0 fw-bold">Logged in successfully</p>
                                        <small className="text-muted">Just now</small>
                                    </div>
                                </div>
                                <div className="d-flex mb-3">
                                    <div className="me-3">
                                        <span className="badge bg-primary rounded-circle p-2">
                                            <i className="bi bi-person"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <p className="mb-0 fw-bold">Account created</p>
                                        <small className="text-muted">
                                            {userDetails?.created_at ? new Date(userDetails.created_at).toLocaleDateString() : 'Recently'}
                                        </small>
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <div className="me-3">
                                        <span className="badge bg-info rounded-circle p-2">
                                            <i className="bi bi-envelope"></i>
                                        </span>
                                    </div>
                                    <div>
                                        <p className="mb-0 fw-bold">Email verified</p>
                                        <small className="text-muted">
                                            {userDetails?.is_verified ? 'Verified' : 'Pending verification'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;