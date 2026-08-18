import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import xss from 'xss';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';

dotenv.config();

// Import our routes
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(mongoSanitize()); // Prevent NoSQL injection

// Custom XSS middleware
app.use((req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
});



// Additional security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

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
