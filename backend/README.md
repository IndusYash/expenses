# Finance Tracker Backend

Backend API for Finance Tracker application built with Node.js, Express, and MongoDB.

## Features
- User authentication with JWT
- Transaction management (CRUD)
- Receipt management with base64 image storage
- Protected routes with middleware
- MongoDB integration

## Tech Stack
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` file and update:
- MongoDB connection string (local or Atlas)
- JWT secret key
- Port (default: 5000)

### 3. Start Server
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Transactions
- `GET /api/transactions` - Get all transactions (protected)
- `POST /api/transactions` - Create transaction (protected)
- `PUT /api/transactions/:id` - Update transaction (protected)
- `DELETE /api/transactions/:id` - Delete transaction (protected)

### Receipts
- `GET /api/receipts` - Get all receipts (protected)
- `POST /api/receipts` - Create receipt (protected)
- `PUT /api/receipts/:id` - Update receipt (protected)
- `DELETE /api/receipts/:id` - Delete receipt (protected)

## Project Structure
```
backend/
├── config/
│   └── db.js              # Database connection
├── models/
│   ├── User.js            # User model
│   ├── Transaction.js     # Transaction model
│   └── Receipt.js         # Receipt model
├── routes/
│   ├── auth.js            # Auth routes
│   ├── transactions.js    # Transaction routes
│   └── receipts.js        # Receipt routes
├── controllers/
│   ├── authController.js
│   ├── transactionController.js
│   └── receiptController.js
├── middleware/
│   └── auth.js            # JWT middleware
├── .env                   # Environment variables
├── server.js              # Main server file
└── package.json
```

## Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## Testing with Postman/Thunder Client

### Register User
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Transaction (Protected)
```
POST http://localhost:5000/api/transactions
Headers: Authorization: Bearer <your_token>
Body: {
  "type": "expense",
  "category": "Food",
  "amount": 50,
  "date": "2024-01-15",
  "description": "Groceries"
}
```

## Next Steps
1. Test all API endpoints
2. Update frontend to use API instead of localStorage
3. Deploy backend to cloud (Render, Railway, etc.)
4. Set up production MongoDB Atlas cluster
