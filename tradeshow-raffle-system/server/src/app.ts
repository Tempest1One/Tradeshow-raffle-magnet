import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectionInstance } from './database/connection.js';

// Import routes
import healthRoutes from './routes/health.ts';
import emailRoutes from './routes/email.ts';

// Import services
import SocketService from './services/socketService.ts';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ['GET', 'POST']
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/api/emails', emailRoutes);

// Initialize SocketService with advanced WebSocket handling
const socketService = new SocketService(io);

// Start the server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to database first
    await connectionInstance.connect();

    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO server ready for connections`);
      console.log(`🗄️ Database connection: ${connectionInstance.getConnectionStatus() ? 'Connected' : 'Disconnected'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📧 Email API: http://localhost:${PORT}/api/emails`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();