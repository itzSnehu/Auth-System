import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
            <div className="container">
                {/* Brand/Logo */}
                <NavLink className="navbar-brand fw-bold" to="/">
                    <i className="bi bi-shield-lock"></i> Auth App
                </NavLink>

                {/* Mobile Toggle Button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMenu}
                    aria-controls="navbarNav"
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation Items */}
                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {isLoggedIn ? (
                            <>
                                {/* User Greeting with Avatar */}
                                <li className="nav-item me-2">
                                    <span className="nav-link text-light d-flex align-items-center">
                                        <span className="bg-light text-primary rounded-circle p-1 me-2 d-inline-flex align-items-center justify-content-center" 
                                              style={{ width: '32px', height: '32px' }}>
                                            <i className="bi bi-person-fill"></i>
                                        </span>
                                        <span className="d-none d-md-inline">
                                            Welcome, {user?.firstName || user?.username || 'User'}
                                        </span>
                                    </span>
                                </li>

                                {/* Home Link */}
                                <li className="nav-item">
                                    <NavLink 
                                        className={({ isActive }) => 
                                            `nav-link ${isActive ? 'active' : ''}`
                                        } 
                                        to="/"
                                    >
                                        <i className="bi bi-house-door"></i> Home
                                    </NavLink>
                                </li>

                                {/* Profile Dropdown (Optional) */}
                                <li className="nav-item dropdown">
                                    <a 
                                        className="nav-link dropdown-toggle" 
                                        href="#" 
                                        role="button" 
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className="bi bi-person-gear"></i>
                                    </a>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <NavLink 
                                                className="dropdown-item" 
                                                to="/profile"
                                                activeClassName="active"
                                            >
                                                <i className="bi bi-person"></i> Profile
                                            </NavLink>
                                        </li>
                                        <li>
                                            <a className="dropdown-item" href="#">
                                                <i className="bi bi-gear"></i> Settings
                                            </a>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button 
                                                className="dropdown-item text-danger" 
                                                onClick={handleLogout}
                                            >
                                                <i className="bi bi-box-arrow-right"></i> Logout
                                            </button>
                                        </li>
                                    </ul>
                                </li>

                                {/* Logout Button (Mobile) */}
                                <li className="nav-item d-md-none">
                                    <button 
                                        className="btn btn-danger btn-sm w-100 mt-2"
                                        onClick={handleLogout}
                                    >
                                        <i className="bi bi-box-arrow-right"></i> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                {/* Login Link */}
                                <li className="nav-item">
                                    <NavLink 
                                        className={({ isActive }) => 
                                            `nav-link ${isActive ? 'active' : ''}`
                                        } 
                                        to="/login"
                                    >
                                        <i className="bi bi-box-arrow-in-right"></i> Login
                                    </NavLink>
                                </li>

                                {/* Register Link */}
                                <li className="nav-item">
                                    <NavLink 
                                        className={({ isActive }) => 
                                            `nav-link ${isActive ? 'active' : ''}`
                                        } 
                                        to="/register"
                                    >
                                        <i className="bi bi-person-plus"></i> Register
                                    </NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

