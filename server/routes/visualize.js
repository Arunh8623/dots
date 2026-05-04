const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { createVisualization, getVisualization } = require('../controllers/visualizeController');

router.post('/',    auth, createVisualization);
router.get('/:id',  auth, getVisualization);

module.exports = router;