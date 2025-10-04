import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseConnection {
  static #instance;
  #isConnected = false;

  constructor() {}

  static getInstance() {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
    }
    return DatabaseConnection.#instance;
  }

  async connect() {
    if (this.#isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      console.log('Connecting to MongoDB...');
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false
      });

      this.#isConnected = true;
      console.log('✅ MongoDB connected successfully');

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.#isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.#isConnected = false;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      this.#isConnected = false;
      throw error;
    }
  }

  getConnectionStatus() {
    return this.#isConnected && mongoose.connection.readyState === 1;
  }
}

export const connectionInstance = DatabaseConnection.getInstance();

export const connectDatabase = () => connectionInstance.connect();
export const disconnectDatabase = () => mongoose.disconnect();
