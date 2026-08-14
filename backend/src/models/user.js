import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Think of this as a User class - it defines ALL operations with users
class User {
    
    // CREATE: Add a new user
    static async create(userData) {
        const { username, email, password, firstName, lastName } = userData;
        
        // 1. Hash the password (scramble it!)
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // 2. Insert into database
        const sql = `
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, username, email, first_name, last_name, role, created_at
        `;
        
        const values = [username, email, passwordHash, firstName, lastName];
        const result = await query(sql, values);
        return result.rows[0]; // Return created user (without password)
    }
    
    // READ: Find user by email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await query(sql, [email]);
        return result.rows[0];
    }
    
    // READ: Find by username
    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = $1';
        const result = await query(sql, [username]);
        return result.rows[0];
    }
    
    // READ: Find by ID
    static async findById(id) {
        const sql = `
            SELECT id, username, email, first_name, last_name, 
                   role, is_active, is_verified, created_at, last_login
            FROM users WHERE id = $1
        `;
        const result = await query(sql, [id]);
        return result.rows[0];
    }
    
    // UPDATE: Save refresh token
    static async updateRefreshToken(userId, refreshToken) {
        const sql = 'UPDATE users SET refresh_token = $1 WHERE id = $2';
        await query(sql, [refreshToken, userId]);
    }
    
    // UPDATE: Update last login time
    static async updateLastLogin(userId) {
        const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
        await query(sql, [userId]);
    }
    
    // VERIFY: Check if password matches
    static async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

export default User;

