import crypto from 'crypto';
import User from '../models/User.js';
import { generateTokens, verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';
import { 
    sendVerificationEmail, 
    sendPasswordResetEmail 
} from '../services/emailService.js';
import { validateEmail } from '../utils/validators.js';

// REGISTER: Creating a new account
export const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        
        // Check existing users
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }
        
        // Create user
        const user = await User.create({
            username,
            email,
            password,
            firstName,
            lastName
        });
        
        // Generate verification token
        const verificationToken = await User.createEmailVerification(user.id);
        
        // Send verification email (don't block response)
        try {
            await sendVerificationEmail(user.email, user.username, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Still return success, but note that email failed
            // In production, you might want to retry or queue it
        }
        
        // Generate tokens (optional, or require email verification first)
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
        await User.updateRefreshToken(user.id, refreshToken);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email.',
            data: {
                user,
                accessToken,
                refreshToken,
                requiresEmailVerification: true
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
};

// Verify email endpoint
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token required'
            });
        }
        
        const user = await User.verifyEmail(token);
        
        res.json({
            success: true,
            message: 'Email verified successfully',
            data: user
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Email verification failed'
        });
    }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (user.is_verified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }
        
        const verificationToken = await User.createEmailVerification(userId);
        await sendVerificationEmail(user.email, user.username, verificationToken);
        
        res.json({
            success: true,
            message: 'Verification email sent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification email',
            error: error.message
        });
    }
};

// LOGIN: Authenticating a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // 2. Verify password
        const isPasswordValid = await User.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // 3. Update last login time
        await User.updateLastLogin(user.id);
        
        // 4. Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
        await User.updateRefreshToken(user.id, refreshToken);
        
        // 5. Remove sensitive data before sending
        delete user.password_hash;
        delete user.refresh_token;
        
        // 6. Send response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user,
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
};

// LOGOUT: Clearing session
export const logout = async (req, res) => {
    try {
        // Remove refresh token from database
        await User.updateRefreshToken(req.userId, null);
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

// GET USER: Get current user info
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            // For security, don't reveal if email exists or not
            return res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }
        
        // Create reset token
        const resetToken = await User.createPasswordResetToken(user.id);
        
        // Send password reset email
        try {
            await sendPasswordResetEmail(user.email, user.username, resetToken);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Still return success to avoid revealing user existence
            // But log the error for debugging
        }
        
        res.json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
        
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Validate inputs
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }
        
        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required'
            });
        }
        
        // Validate password strength (optional but recommended)
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters'
            });
        }
        
        // Reset the password
        const user = await User.resetPassword(token, newPassword);
        
        // Send success email (optional)
        try {
            await sendPasswordResetSuccessEmail(user.email, user.username);
        } catch (emailError) {
            console.error('Failed to send password reset success email:', emailError);
            // Don't fail the request if email fails
        }
        
        // Generate new tokens (optional - user can login with new password)
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
        await User.updateRefreshToken(user.id, refreshToken);
        
        res.json({
            success: true,
            message: 'Password reset successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                accessToken,
                refreshToken
            }
        });
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        // Handle specific errors
        let statusCode = 400;
        let message = error.message || 'Failed to reset password';
        
        if (error.message === 'Invalid or expired reset token') {
            statusCode = 400;
        } else if (error.message === 'Token has already been used') {
            statusCode = 400;
        } else if (error.message === 'Token has expired') {
            statusCode = 400;
        } else {
            statusCode = 500;
            message = 'Failed to reset password';
        }
        
        res.status(statusCode).json({
            success: false,
            message: message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Check if reset token is valid
// @route   GET /api/auth/validate-reset-token
// @access  Public
export const validateResetToken = async (req, res) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }
        
        // Verify the token
        const userId = await User.verifyPasswordResetToken(token);
        
        // If we get here, token is valid
        res.json({
            success: true,
            message: 'Token is valid',
            data: { userId }
        });
        
    } catch (error) {
        console.error('Validate token error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid token'
        });
    }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }
        
        // Verify refresh token
        const decoded = verifyToken(refreshToken);
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
        
        // Check if refresh token matches
        if (user.refresh_token !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
        
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(
            user.id,
            user.email,
            user.role
        );
        
        // Update refresh token in database
        await User.updateRefreshToken(user.id, newRefreshToken);
        
        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token',
            error: error.message
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const userId = req.userId; // From auth middleware
        
        // Check if email is taken by another user
        if (email) {
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
        }
        
        // Update user
        const updatedUser = await User.update(userId, {
            firstName,
            lastName,
            email,
            password
        });
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

