const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) return; // Already connected
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout for serverless
    });
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('Unable to connect:', error.message);
    throw error; // Let Vercel handle retries
  }
};

module.exports = connectDB;