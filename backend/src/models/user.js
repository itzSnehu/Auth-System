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

// Create email verification token

static async createEmailVerification(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const sql = `
        INSERT INTO email_verifications (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING token
    `;
    const result = await query(sql, [userId, token, expiresAt]);
    return result.rows[0].token;
}

// Verify email
static async verifyEmail(token) {
    // Find verification record
    const findSql = `
        SELECT user_id, expires_at, verified_at
        FROM email_verifications
        WHERE token = $1
    `;
    const result = await query(findSql, [token]);
    
    if (result.rows.length === 0) {
        throw new Error('Invalid verification token');
    }
    
    const verification = result.rows[0];
    
    if (verification.verified_at) {
        throw new Error('Email already verified');
    }
    
    if (new Date() > verification.expires_at) {
        throw new Error('Verification token expired');
    }
    
    // Update user as verified
    const updateSql = `
        UPDATE users 
        SET is_verified = true, 
            email_verified_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, username, email
    `;
    const updatedUser = await query(updateSql, [verification.user_id]);
    
    // Mark verification as used
    const markUsedSql = `
        UPDATE email_verifications 
        SET verified_at = CURRENT_TIMESTAMP
        WHERE token = $1
    `;
    await query(markUsedSql, [token]);
    
    return updatedUser.rows[0];
}

// Check if email is verified
static async isEmailVerified(userId) {
    const sql = 'SELECT is_verified FROM users WHERE id = $1';
    const result = await query(sql, [userId]);
    return result.rows[0]?.is_verified || false;
}

// UPDATE: Update user
static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    // Build dynamic update query
    if (updateData.firstName) {
        fields.push(`first_name = $${paramIndex++}`);
        values.push(updateData.firstName);
    }
    if (updateData.lastName) {
        fields.push(`last_name = $${paramIndex++}`);
        values.push(updateData.lastName);
    }
    if (updateData.email) {
        fields.push(`email = $${paramIndex++}`);
        values.push(updateData.email);
    }
    if (updateData.password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const passwordHash = await bcrypt.hash(updateData.password, saltRounds);
        fields.push(`password_hash = $${paramIndex++}`);
        values.push(passwordHash);
    }
    
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const sql = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, username, email, first_name, last_name, role
    `;
    
    const result = await query(sql, values);
    return result.rows[0];
}

}

export default User;

