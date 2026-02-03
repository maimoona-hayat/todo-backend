require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const user = require('./routes/auth');
const todo = require('./routes/todo');
const cors = require('cors');

// Global DB connection for serverless (avoids reconnecting per request)
let cachedDb = null;
const connectToDatabase = async () => {
  if (cachedDb) return cachedDb;
  await connectDB();
  cachedDb = true;
  return cachedDb;
};

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Routes
app.use('/api/v1/user', user);
app.use('/api/v1/todo', todo);

// 404 handler
app.use((req, res) => res.status(404).send({ message: `API route not found`, route: `${req.hostname}${req.url}` }));

// Export for Vercel (serverless)
module.exports = async (req, res) => {
  await connectToDatabase(); // Ensure DB is connected
  return app(req, res); // Pass request to Express
};

// For local testing (remove if deploying only to Vercel)
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectToDatabase();
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
      console.error('Failed to start:', err.message);
    }
  };
  startServer();
}