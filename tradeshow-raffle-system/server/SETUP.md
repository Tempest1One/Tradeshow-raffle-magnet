# Quick Setup Guide

## 🚨 Issue: Seed Script Not Working

The seed script is likely hanging because the MongoDB connection string is not configured.

## 🔧 Fix Steps:

### 1. Create .env file
Create a `.env` file in the `server` directory with:

```bash
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/tradeshow-raffle

# For MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tradeshow-raffle

# Server settings
PORT=3001
CLIENT_URL=http://localhost:5173
```

### 2. Install MongoDB (if using local)
- **Windows**: Download from https://www.mongodb.com/try/download/community
- **Or use Docker**: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

### 3. Test the connection
```bash
npm run test-connection
```

### 4. Run the seed script
```bash
npm run seed
```

## 🐛 Troubleshooting

### If you see "MONGODB_URI not set":
- Create the `.env` file as shown above
- Make sure it's in the `server` directory
- Restart your terminal

### If you see "Connection timeout":
- Check if MongoDB is running
- Verify the connection string is correct
- Try using MongoDB Atlas (cloud) instead of local

### If you see "Database connection failed":
- Check MongoDB is running: `mongod --version`
- Check if port 27017 is available
- Try a different port or use MongoDB Atlas

## 🚀 Quick Start with MongoDB Atlas (Cloud)

1. Go to https://cloud.mongodb.com
2. Create a free account
3. Create a new cluster
4. Get the connection string
5. Add it to your `.env` file
6. Run `npm run seed`

## 📝 Example .env file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tradeshow-raffle?retryWrites=true&w=majority
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

