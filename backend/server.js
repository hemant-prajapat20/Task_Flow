const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();



const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Log every incoming request
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Basic route so the server doesn't return 404 when you visit localhost:5000
app.get('/', (req, res) => {
  res.send('TaskFlow Backend API is running successfully! Please open the frontend at http://localhost:5173');
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Connect to database first, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server successfully running at: http://localhost:${PORT}`);
  });
});
