import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

// Import our routes
import authRoutes from './routes/authRoutes.js';

const app = express();

// ----- MIDDLEWARE (runs on every request) -----

// 1. Security: Adds protective headers
app.use(helmet());

// 2. CORS: Allows cross-origin requests
app.use(cors());

// 3. Parse JSON requests
app.use(express.json());

// 4. Parse URL-encoded requests (form data)
app.use(express.urlencoded({ extended: true }));

// 5. Logging: Shows what's happening
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ----- ROUTES -----
app.use('/api/auth', authRoutes);

// ----- HEALTH CHECK -----
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ----- ERROR HANDLING -----

// 404: Route not found
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// 500: Server error
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export default app;
