CREATE TABLE users (
 id SERIAL PRIMARY KEY, 
 username VARCHAR(50) UNIQUE NOT NULL, 
 email VARCHAR(255) UNIQUE NOT NULL, 
 password_hash VARCHAR(255) NOT NULL, 
 first_name VARCHAR(50), 
 last_name VARCHAR(50), 
 is_active BOOLEAN DEFAULT true, 
 is_verified BOOLEAN DEFAULT false,
 role VARCHAR(20) DEFAULT 'user',
 refresh_token TEXT, 
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
 last_login TIMESTAMP 
);


-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);