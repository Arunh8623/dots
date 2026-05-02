const fs = require('fs');
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, '../videos');
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure directories exist on startup
const ensureDirs = () => {
  [VIDEOS_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
};

// Delete a video file by its URL path
const deleteVideoFile = (videoUrl) => {
  try {
    if (!videoUrl) return;
    const filename = path.basename(videoUrl);
    const fullPath = path.join(VIDEOS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`🗑️  Deleted video: ${filename}`);
    }
  } catch (err) {
    console.error('Error deleting video file:', err.message);
  }
};

// Clean up all temp files older than 1 hour
const cleanOldTempFiles = () => {
  try {
    if (!fs.existsSync(TEMP_DIR)) return;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    const files = fs.readdirSync(TEMP_DIR);
    files.forEach(file => {
      const fullPath = path.join(TEMP_DIR, file);
      try {
        const stat = fs.statSync(fullPath);
        if (now - stat.mtimeMs > oneHour) {
          if (stat.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(fullPath);
          }
          console.log(`🧹 Cleaned temp: ${file}`);
        }
      } catch (e) { /* skip locked files */ }
    });
  } catch (err) {
    console.error('Temp cleanup error:', err.message);
  }
};

// Get size of a file in MB
const getFileSizeMB = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    return (stat.size / (1024 * 1024)).toFixed(2);
  } catch {
    return null;
  }
};

// List all generated videos
const listVideos = () => {
  try {
    if (!fs.existsSync(VIDEOS_DIR)) return [];
    return fs.readdirSync(VIDEOS_DIR)
      .filter(f => f.endsWith('.mp4'))
      .map(f => ({
        filename: f,
        path: path.join(VIDEOS_DIR, f),
        url: `/videos/${f}`,
        sizeMB: getFileSizeMB(path.join(VIDEOS_DIR, f))
      }));
  } catch {
    return [];
  }
};

module.exports = {
  ensureDirs,
  deleteVideoFile,
  cleanOldTempFiles,
  getFileSizeMB,
  listVideos,
  VIDEOS_DIR,
  TEMP_DIR
};