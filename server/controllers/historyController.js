const Visualization = require('../models/Visualization');

// GET /api/history - Get all past visualizations
const getHistory = async (req, res) => {
  try {
    const history = await Visualization.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('originalPrompt videoUrl createdAt topic status notes');
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/history/:id
const deleteVisualization = async (req, res) => {
  try {
    await Visualization.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getHistory, deleteVisualization };