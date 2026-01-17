const express = require('express');
const multer = require('multer');
const { analyzeUploadedImage } = require('../controllers/analysisController');

const router = express.Router();

// I use memory storage since we're processing images immediately
const upload = multer({ storage: multer.memoryStorage() });

// Keep the route handler simple - just handle file upload and delegate
router.post('/', upload.single('image'), analyzeUploadedImage);

module.exports = router;