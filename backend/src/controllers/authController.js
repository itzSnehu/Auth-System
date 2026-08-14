import User from '../models/User.js';
import { generateTokens, verifyToken } from '../utils/jwt.js';

// REGISTER: Creating a new account
export const register = async (req, res) => {
    try {
        // 1. Get user input
        const { username, email, password, firstName, lastName } = req.body;
        
        // 2. Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        
        // 3. Check if username taken
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }
        
        // 4. Create the user
        const user = await User.create({
            username,
            email,
            password,
            firstName,
            lastName
        });
        
        // 5. Generate tokens (so they don't need to login immediately)
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);
        await User.updateRefreshToken(user.id, refreshToken);
        
        // 6. Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                accessToken,
                refreshToken
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