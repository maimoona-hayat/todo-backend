require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const user = require('./routes/auth');
const todo = require('./routes/todo');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1/user', user);
app.use('/api/v1/todos', todo);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
