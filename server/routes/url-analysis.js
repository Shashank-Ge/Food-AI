const express = require('express');
const { analyzeImageFromUrl } = require('../controllers/analysisController');

const router = express.Router();

// I keep routes simple - just handle the HTTP stuff and delegate to controllers
router.post('/', analyzeImageFromUrl);

module.exports = router;