import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

// This middleware checks if user is authenticated
export const authenticate = async (req, res, next) => {
    try {
        // 1. Get the token from the header
        const authHeader = req.headers.authorization;
        
        // Format should be: "Bearer eyJhbGciOiJIUzI1NiIs..."
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // 2. Extract the actual token
        const token = authHeader.split(' ')[1];
        
        // 3. Verify the token
        const decoded = verifyToken(token);
        
        // 4. Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // 5. Attach user to the request (so controllers can use it)
        req.user = user;
        req.userId = decoded.userId;
        
        // 6. Continue to the next function
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
};