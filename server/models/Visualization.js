const mongoose = require('mongoose');

const VisualizationSchema = new mongoose.Schema({
  originalPrompt: { type: String, required: true, trim: true },
  engineeredPrompt: { type: String, default: '' },
  manimCode: { type: String, default: '' },
  videoPath: { type: String, default: null },
  videoUrl: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: { type: String, default: null },
  duration: { type: Number, default: null },
  topic: { type: String, default: 'Mathematics' },
  notes: { type: Object, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Visualization', VisualizationSchema);