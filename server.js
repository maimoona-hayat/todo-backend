require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const userRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todo');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/todo', todoRoutes);

// Test route (IMPORTANT for Railway)
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error('Server failed to start:', err.message);
  }
};

startServer();
