import express from 'express';
const router = express.Router();
import {
    register,
    login,
    logout,
    getCurrentUser
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

// PUBLIC ROUTES - Anyone can access
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// PROTECTED ROUTES - Need authentication
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;

