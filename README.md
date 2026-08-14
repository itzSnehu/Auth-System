# 🔐 Authentication System - Full Stack

A complete authentication system with Node.js + Express + PostgreSQL backend and React frontend.

## ✨ Features

- ✅ User Registration & Login
- ✅ JWT Authentication (Access + Refresh Tokens)
- ✅ Protected Routes
- ✅ Password Hashing (bcrypt)
- ✅ PostgreSQL Database
- ✅ React Frontend with Bootstrap
- ✅ Form Validation
- ✅ Responsive UI

## 🛠️ Tech Stack

**Backend:** Node.js, Express, PostgreSQL, JWT, bcrypt  
**Frontend:** React, React Router, Axios, Bootstrap

## 📁 Project Structure

```
auth-api/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # Auth context
│   │   ├── services/     # API services  
│   │   └── App.js
│   └── package.json
├── backend/
|   ├── src/               # Backend
│   |   ├── config/        # Database config
│   |   ├── controllers/   # Auth logic
│   |   ├── middleware/    # Auth & validation
│   |   ├── models/        # User model
│   |   ├── routes/        # API routes
│   |   └── utils/         # Helpers
|   ├── .env
|   ├── server.js
|   └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)

### Installation

```bash
# Clone repository
git clone https://github.com/itzSnehu/Authentication.git
cd auth-api

# Install backend dependencies
cd backend
npm install
cd ..
# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Environment Variables

Create `.env` in backend root:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=auth_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d
BCRYPT_SALT_ROUNDS=10
```

### Database Setup

```bash
# Create database
psql -U postgres
CREATE DATABASE auth_db;
\c auth_db;
\q

# Run migrations
psql -U postgres -d auth_db -f src/config/database.sql
```

### Run Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

Access: http://localhost:3000

## 📧 Contact

Sneha Dhar - dharsneha109@gmail.com

<!-- Project Link: https://github.com/yourusername/auth-api -->

---