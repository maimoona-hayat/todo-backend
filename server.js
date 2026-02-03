require('dotenv').config();
const express = require('express');

const connectDB = require('./config/db');
const user = require('./routes/auth');
const todo = require('./routes/todo');
const cors = require('cors')

const app = express();

// Global DB connection cache (for serverless)
let cachedDb = null;
const connectToDatabase = async () => {
  if (cachedDb) return cachedDb;
  await connectDB();
  cachedDb = true;
  return cachedDb;
};


app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-auth-token", "Authorization"]
}));

// Routes
app.use('/api/v1/user', user);
app.use('/api/v1/todo', todo);

// 404 handler
app.use((req, res) =>
  res.status(404).send({ message: 'API route not found', route: `${req.hostname}${req.url}` })
);

// Serverless export (Vercel)
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};

// Local server (for testing)
if (require.main === module) {
  const startServer = async () => {
    try {
      await connectToDatabase();
      const PORT = process.env.PORT||5000
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
      console.error('Failed to start server:', err.message);
    }
  };
  startServer();
}
