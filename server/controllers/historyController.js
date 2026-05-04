const Visualization = require('../models/Visualization');
const { deleteVideo } = require('../services/cloudinaryService');

const getHistory = async (req, res) => {
  try {
    const history = await Visualization.find({ user: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('originalPrompt videoUrl createdAt topic status notes difficulty quality');
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteVisualization = async (req, res) => {
  try {
    const viz = await Visualization.findOne({ _id: req.params.id, user: req.user._id });
    if (!viz) return res.status(404).json({ error: 'Not found' });

    // Delete from Cloudinary if it has a cloudinary id
    if (viz.cloudinaryId) await deleteVideo(viz.cloudinaryId);

    await viz.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHistory, deleteVisualization };