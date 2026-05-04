require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB = require('./config/db');
const { ensureDirs, cleanOldTempFiles } = require('./services/fileService');

const app = express();

connectDB();
ensureDirs();
setInterval(cleanOldTempFiles, 60 * 60 * 1000);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/visualize', require('./routes/visualize'));
app.use('/api/history',   require('./routes/history'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🎓 dots Server                  ║
║   Port: ${PORT}                         ║
║   Auth: JWT + bcrypt                 ║
║   Storage: Cloudinary                ║
╚══════════════════════════════════════╝
  `);
});