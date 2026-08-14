import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateTokens = (userId, email, role = 'user') => {
    // What info do we want on the ID card?
    const payload = {
        userId,
        email,
        role
    };
    
    // Access Token: Short-term ID (like a day pass)
    const accessToken = jwt.sign(
        payload,
        process.env.JWT_SECRET,  // Our secret stamp
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    // Refresh Token: Long-term membership (gets new passes)
    const refreshToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d' }
    );
    
    return { accessToken, refreshToken };
};


// Verify if ID card is genuine
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw error;
    }
};
