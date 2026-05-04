const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { getHistory, deleteVisualization } = require('../controllers/historyController');

router.get('/',        auth, getHistory);
router.delete('/:id',  auth, deleteVisualization);

module.exports = router;