import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20,           
    idleTimeoutMillis: 30000, // Close idle connections after 30s
});

// Test if we can actually connect
export const testConnection = async () => {
    try {
        // Try to grab a connection from the pool
        const client = await pool.connect();
        console.log('Connected to PostgreSQL!');
        client.release(); // Give it back to the pool
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

// Helper for executing queries safely
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`Query executed in ${duration}ms`);
        return result;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

export default pool;
