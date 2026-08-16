import express from 'express';
const router = express.Router();
import {
    register,
    login,
    logout,
    refreshToken,
    updateProfile,
    getCurrentUser,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,       
    validateResetToken 
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration, validateProfileUpdate, validateLogin } from '../middleware/validation.js';
import {
    generalLimiter,
    loginLimiter,
    registerLimiter,
    passwordResetLimiter
} from '../middleware/rateLimiter.js';


// Apply general rate limiting to all routes
router.use(generalLimiter);

// Public routes with specific rate limits
router.post('/register', registerLimiter, validateRegistration, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/refresh', refreshToken);

router.post('/forgot-password', passwordResetLimiter, requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.get('/verify-email', verifyEmail);
router.get('/validate-reset-token', validateResetToken);
router.post('/resend-verification', authenticate, resendVerificationEmail);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, validateProfileUpdate, updateProfile);

export default router;
