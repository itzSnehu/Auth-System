import { query } from '../config/database.js';

class session {
    static async create(userId, token, deviceInfo = {}) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        const sql = `
            INSERT INTO sessions (user_id, token, device_name, ip_address, user_agent, expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [
            userId,
            token,
            deviceInfo.deviceName || 'Unknown Device',
            deviceInfo.ipAddress || null,
            deviceInfo.userAgent || null,
            expiresAt
        ];
        
        const result = await query(sql, values);
        return result.rows[0];
    }
    
    static async findActiveByUser(userId) {
        const sql = `
            SELECT * FROM sessions 
            WHERE user_id = $1 AND is_active = true AND expires_at > NOW()
            ORDER BY created_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }
    
    static async revokeSession(sessionId) {
        const sql = `
            UPDATE sessions 
            SET is_active = false, last_activity = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        const result = await query(sql, [sessionId]);
        return result.rows[0];
    }
    
    static async revokeAllSessions(userId, exceptSessionId = null) {
        let sql = `
            UPDATE sessions 
            SET is_active = false, last_activity = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND is_active = true
        `;
        const values = [userId];
        
        if (exceptSessionId) {
            sql += ` AND id != $2`;
            values.push(exceptSessionId);
        }
        
        const result = await query(sql, values);
        return result.rowCount;
    }
    
    static async updateActivity(sessionId) {
        const sql = `
            UPDATE sessions 
            SET last_activity = CURRENT_TIMESTAMP
            WHERE id = $1
        `;
        await query(sql, [sessionId]);
    }
}

export default session;