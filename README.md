# 🎓 dots — See Mathematics

A full-stack MERN application that converts math questions into 3Blue1Brown-style Manim animations using Gemini AI.

## 🏗️ Architecture

```
User Question → Gemini (Prompt Engineer) → Gemini (Manim Code Gen) → Manim Render → FFmpeg (+ Music) → Video
```

## 📋 Prerequisites (Windows)

1. **Node.js** v18+ → https://nodejs.org
2. **Python 3.10+** → https://python.org
3. **Manim Community** → `pip install manim`
4. **FFmpeg** → https://ffmpeg.org/download.html (add to PATH)
5. **MiKTeX** (LaTeX for Windows) → https://miktex.org/download

Verify everything works:
```bash
node --version
python --version
python -m manim --version
ffmpeg -version
```

## 🚀 Setup & Run

### 1. Install server dependencies
```bash
cd server
npm install
```

### 2. Generate background music (run once)
```bash
cd server/python
python generate_music.py
```

### 3. Install client dependencies
```bash
cd client
npm install
```

### 4. Start the server (Terminal 1)
```bash
cd server
npm run dev
```

### 5. Start the client (Terminal 2)
```bash
cd client
npm run dev
```

### 6. Open your browser
```
http://localhost:5173
```

## 🎬 How It Works

1. **You type** a math question in the chat interface
2. **Gemini AI** re-engineers your prompt with deep mathematical intuition
3. **Gemini AI** writes complete Manim Python code for a 3Blue1Brown-style animation
4. **Manim** renders the animation frame-by-frame into an MP4
5. **FFmpeg** mixes in soft ambient background music
6. **You watch** the beautiful math visualization!

If Manim code has errors, Gemini automatically fixes and retries (up to 3 times).

## ⏱️ Expected Time

- Gemini API calls: ~10-20 seconds
- Manim rendering: ~60-180 seconds (depends on animation complexity)
- Total: **2-4 minutes** per visualization

## 🎨 Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **AI**: Google Gemini 2.0 Flash
- **Animation**: Manim Community Edition
- **Audio**: FFmpeg

## 📁 Video Storage

Generated videos are saved in `server/videos/` and served at:
```
http://localhost:5000/videos/final_[id].mp4
```

## 🐛 Troubleshooting

**Manim fails with LaTeX errors:**
- Make sure MiKTeX is installed and added to PATH
- Run MiKTeX Console and install missing packages automatically

**FFmpeg not found:**
- Download FFmpeg, extract it, and add the `bin/` folder to Windows PATH
- Restart your terminal after adding to PATH

**MongoDB connection fails:**
- Check your Atlas IP whitelist (add 0.0.0.0/0 for development)
- Verify the connection string in `server/.env`

**Video not found after rendering:**
- Manim creates nested folder structures; the server searches recursively
- Check `server/temp/videos/` for the rendered file