const Visualization = require('../models/Visualization');
const { engineerPrompt, generateManimCode, generateNotes } = require('../services/geminiService');
const { generateVideo } = require('../services/manimService');
const { uploadVideo }   = require('../services/cloudinaryService');

const QUALITY_MAP = { fast:'l', medium:'m', high:'h' };

const AUDIENCE_MAP = {
  child:      'Explain like the viewer is a curious 10-12 year old. Use only everyday objects and analogies. Zero jargon.',
  highschool: 'Explain for a high school student who knows basic algebra and geometry. Build intuition first.',
  undergrad:  'Explain at university undergraduate level with proper mathematical notation.',
  engineer:   'Explain for a practicing engineer. Focus on practical intuition and real-world applications.',
  grad:       'Explain at graduate research level with full mathematical rigor.',
};

const createVisualization = async (req, res) => {
  const { prompt, difficulty = 'highschool', quality = 'medium' } = req.body;
  const userId = req.user._id;

  if (!prompt || prompt.trim().length < 5)
    return res.status(400).json({ error: 'Please provide a valid math question.' });

  const visualization = new Visualization({
    user: userId,
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
    if (res.flush) res.flush();
  };

  try {
    // Step 1: Engineer prompt
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

    // Step 3: Render video locally
    const qualityFlag = QUALITY_MAP[quality] || 'm';
    sendEvent('rendering', `Rendering video at ${quality === 'fast' ? '480p' : quality === 'high' ? '1080p' : '720p'}...`);
    const result = await generateVideo(manimCode, prompt, (stage, message) => {
      sendEvent(stage, message);
    }, qualityFlag);

    // Step 4: Upload to Cloudinary
    sendEvent('uploading', '☁️ Uploading to cloud storage...');
    const { publicId, secureUrl } = await uploadVideo(
      result.videoPath,
      userId.toString(),
      result.jobId
    );

    // Step 5: Generate notes
    sendEvent('notes', 'Generating study notes...');
    const notes = await generateNotes(prompt, engineered);

    // Step 6: Save everything
    visualization.status       = 'completed';
    visualization.cloudinaryId = publicId;
    visualization.videoUrl     = secureUrl;
    visualization.notes        = notes;
    visualization.topic        = notes?.topic || 'Mathematics';
    await visualization.save();

    sendEvent('completed', 'Your math visualization is ready!', {
      videoUrl: secureUrl,
      videoId:  visualization._id,
      notes,
    });

  } catch (error) {
    console.error('Pipeline error:', error.message);
    visualization.status       = 'failed';
    visualization.errorMessage = error.message;
    await visualization.save();
    sendEvent('error', error.message, { error: error.message });
  } finally {
    res.end();
  }
};

const getVisualization = async (req, res) => {
  try {
    const viz = await Visualization.findOne({ _id: req.params.id, user: req.user._id });
    if (!viz) return res.status(404).json({ error: 'Not found' });
    res.json(viz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createVisualization, getVisualization };