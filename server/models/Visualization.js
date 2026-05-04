const mongoose = require('mongoose');

const VisualizationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalPrompt:   { type: String, required: true, trim: true },
  engineeredPrompt: { type: String, default: '' },
  manimCode:        { type: String, default: '' },

  // Cloudinary fields
  cloudinaryId:     { type: String, default: null },   // public_id
  videoUrl:         { type: String, default: null },   // secure_url from Cloudinary

  status: {
    type: String,
    enum: ['pending','generating','completed','failed'],
    default: 'pending',
  },
  errorMessage: { type: String, default: null },
  topic:        { type: String, default: 'Mathematics' },
  difficulty:   { type: String, default: 'highschool' },
  quality:      { type: String, default: 'medium' },
  notes:        { type: Object, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Visualization', VisualizationSchema);