import app from './src/app.js';
import { testConnection } from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    console.log('Starting server...');
    
    // 1. First, check if database is connected
    const dbConnected = await testConnection();
    if (!dbConnected) {
        console.error('Cannot start server without database connection');
        process.exit(1);
    }
    
    // 2. Start listening for requests
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down...');
    process.exit(0);
});

startServer();