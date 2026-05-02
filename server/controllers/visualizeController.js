const Visualization = require('../models/Visualization');
const { engineerPrompt, generateManimCode, generateNotes } = require('../services/geminiService');
const { generateVideo } = require('../services/manimService');

// Quality flag mapping for Manim
const QUALITY_MAP = {
  fast:   'l',   // 480p  ~45s
  medium: 'm',   // 720p  ~2min
  high:   'h',   // 1080p ~5min
};

// Audience context injected into the Gemini prompt
const AUDIENCE_MAP = {
  child:      'Explain like the viewer is a curious 10-12 year old. Use only everyday objects and analogies. Zero jargon. Make it feel like magic.',
  highschool: 'Explain for a high school student who knows basic algebra and geometry. Build intuition first, introduce notation gently.',
  undergrad:  'Explain at university undergraduate level. Use proper mathematical notation and connect to topics they would know (calculus, linear algebra basics).',
  engineer:   'Explain for a practicing engineer. Focus on practical intuition, physical analogies, and real-world applications. Skip pure-math formalism.',
  grad:       'Explain at graduate research level with full mathematical rigor. Use precise definitions, mention edge cases, connect to advanced theory.',
};

const createVisualization = async (req, res) => {
  const { prompt, difficulty = 'highschool', quality = 'medium' } = req.body;

  if (!prompt || prompt.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide a valid math question.' });
  }

  const visualization = new Visualization({
    originalPrompt: prompt.trim(),
    engineeredPrompt: '',
    manimCode: '',
    status: 'generating',
    difficulty,
    quality,
  });
  await visualization.save();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (stage, message, data = {}) => {
    const payload = JSON.stringify({ stage, message, id: visualization._id, ...data });
    res.write(`data: ${payload}\n\n`);
    // Force flush so client receives events immediately
    if (res.flush) res.flush();
  };

  try {
    // Step 1: Engineer prompt — inject audience context
    sendEvent('engineering', 'Analyzing your question with deep mathematical intuition...');
    const audienceContext = AUDIENCE_MAP[difficulty] || AUDIENCE_MAP.highschool;
    const promptWithAudience = `${prompt.trim()}\n\n[AUDIENCE]: ${audienceContext}`;
    const engineered = await engineerPrompt(promptWithAudience);
    visualization.engineeredPrompt = engineered;
    await visualization.save();

    // Step 2: Generate Manim code
    sendEvent('coding', 'Writing 3Blue1Brown-style Manim animation code...');
    const manimCode = await generateManimCode(engineered, prompt.trim(), audienceContext);
    visualization.manimCode = manimCode;
    await visualization.save();

    // Step 3: Render video at chosen quality
    sendEvent('rendering', `Rendering video at ${quality === 'fast' ? '480p' : quality === 'high' ? '1080p' : '720p'}...`);
    const qualityFlag = QUALITY_MAP[quality] || 'm';
    const result = await generateVideo(manimCode, prompt, (stage, message) => {
      sendEvent(stage, message);
    }, qualityFlag);

    // Step 4: Generate notes
    sendEvent('notes', 'Generating study notes...');
    const notes = await generateNotes(prompt, engineered);

    // Step 5: Save everything
    visualization.status = 'completed';
    visualization.videoPath = result.videoPath;
    visualization.videoUrl = result.videoUrl;
    visualization.notes = notes;
    visualization.topic = notes?.topic || 'Mathematics';
    await visualization.save();

    sendEvent('completed', 'Your math visualization is ready!', {
      videoUrl: result.videoUrl,
      videoId: visualization._id,
      notes,
    });

  } catch (error) {
    console.error('Pipeline error:', error.message);
    visualization.status = 'failed';
    visualization.errorMessage = error.message;
    await visualization.save();
    sendEvent('error', error.message, { error: error.message });
  } finally {
    res.end();
  }
};

const getVisualization = async (req, res) => {
  try {
    const viz = await Visualization.findById(req.params.id);
    if (!viz) return res.status(404).json({ error: 'Not found' });
    res.json(viz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createVisualization, getVisualization };