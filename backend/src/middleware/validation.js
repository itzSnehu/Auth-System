import { validateEmail, validatePassword, validateUsername } from '../utils/validators.js';

// This is middleware for registration - checks all fields
export const validateRegistration = (req, res, next) => {
    const { username, email, password, firstName, lastName } = req.body;
    const errors = [];
    
    // Validate username
    if (!username) {
        errors.push('Username is required');
    } else if (!validateUsername(username)) {
        errors.push('Username must be 3-20 characters (alphanumeric and underscores only)');
    }
    
    // Validate email
    if (!email) {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Invalid email format');
    }
    
    // Validate password
    if (!password) {
        errors.push('Password is required');
    } else if (!validatePassword(password)) {
        errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }
    
    // Validate names (optional, but if provided check length)
    if (firstName && firstName.length > 50) {
        errors.push('First name must be less than 50 characters');
    }
    if (lastName && lastName.length > 50) {
        errors.push('Last name must be less than 50 characters');
    }
    
    // If there are errors, return them
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }
    
    // If no errors, continue to the next function (the controller)
    next();
};

// This is middleware for login - checks email and password
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }
    
    next();
};
