const express = require('express');
const { getMealHistory, clearMealHistory } = require('../controllers/historyController');

const router = express.Router();

// I keep routes focused on HTTP concerns only
router.get('/', getMealHistory);
router.delete('/', clearMealHistory);

module.exports = router;