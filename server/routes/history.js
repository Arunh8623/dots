const express = require('express');
const router = express.Router();
const { getHistory, deleteVisualization } = require('../controllers/historyController');

router.get('/', getHistory);
router.delete('/:id', deleteVisualization);

module.exports = router;