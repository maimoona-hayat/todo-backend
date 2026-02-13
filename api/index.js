require('dotenv').config();  // For local dev; Vercel uses its own env vars
const express = require('express');
const cors = require('cors');

const connectDB = require('../config/db');  // Adjust path if needed (assuming api/ is at root level)
const userRoutes = require('../routes/auth');  // Adjust paths to point to your existing files
const todoRoutes = require('../routes/todo');

const app = express();

// Connect to DB (called once per cold start in serverless)
connectDB();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: "*",  // Adjust for production (e.g., your frontend URL)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/todo', todoRoutes);

// Test route (for health checks)
app.get('/', (req, res) => {
  res.send('Backend is running on Vercel 🚀');
});

// Export the app for Vercel (this makes it a serverless function)
module.exports = app;