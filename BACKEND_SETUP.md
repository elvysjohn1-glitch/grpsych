# PsychoFlow Auth Server with MongoDB

## Setup

### Prerequisites
- **Node.js** v14 or higher
- **MongoDB** running locally or a connection string to MongoDB Atlas

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure MongoDB
Edit `.env` to set your MongoDB connection (default is local):
```env
MONGODB_URI=mongodb://localhost:27017/grpsych
PORT=3000
```

**Option A: Local MongoDB**  
Install and run MongoDB locally:
```bash
# macOS / Linux (if using Homebrew)
brew services start mongodb-community

# Windows (if installed as service)
# MongoDB should start automatically on boot
```

**Option B: MongoDB Atlas (Cloud)**  
Get a connection string from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), then update `.env`:
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/grpsych
```

### 3. Start the Server
```bash
npm start
```
You should see: `Auth API listening on http://localhost:3000`  
And: `MongoDB connected`

### 4. Test Registration & Login
The frontend (`psych.html`) will call:
- `POST /api/register` — Register a new user (email must be unique)
- `POST /api/login` — Login with email + password

**Example curl tests:**
```bash
# Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'

# Ping
curl http://localhost:3000/api/ping
```

## Features
- ✅ Unique email constraint (MongoDB unique index)
- ✅ Password hashing with bcrypt
- ✅ CORS enabled for frontend calls
- ✅ Error handling (409 if email already registered, 401 for invalid credentials)

## File Structure
```
grpsych/
├── server.js          # Express + Mongoose auth API
├── package.json       # Dependencies (mongoose, bcrypt, express, cors)
├── .env              # MongoDB URI & PORT config
├── psych.html        # Frontend (calls /api/register & /api/login)
└── contribute.html   # Contribution form page
```

## Notes
- Emails are stored in lowercase for consistency.
- Responses include user `id` (MongoDB ObjectId), `name`, and `email`.
- No JWT tokens are currently issued — optional to add later.
