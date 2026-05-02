require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { ensureDirs, cleanOldTempFiles } = require('./services/fileService');

const app = express();

// Connect to MongoDB
connectDB();

// Ensure video/temp directories exist
ensureDirs();

// Clean old temp files every hour
setInterval(cleanOldTempFiles, 60 * 60 * 1000);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve generated videos as static files
app.use('/videos', express.static(path.join(__dirname, 'videos')));

// API Routes
app.use('/api/visualize', require('./routes/visualize'));
app.use('/api/history', require('./routes/history'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Math Visualizer API running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🎓 Math Visualizer Server          ║
║   Running on port ${PORT}              ║
║   MongoDB: Connected                 ║
║   Gemini: Ready                      ║
║   Manim: Standing by                 ║
╚══════════════════════════════════════╝
  `);
});