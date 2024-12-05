import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
      writeConcern: {
        w: 'majority',
      },
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;  // Propagate error to be caught in index.js
  }
}
