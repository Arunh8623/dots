const express = require('express');
const router = express.Router();
const { createVisualization, getVisualization } = require('../controllers/visualizeController');

router.post('/', createVisualization);
router.get('/:id', getVisualization);

module.exports = router;