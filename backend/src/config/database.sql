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
