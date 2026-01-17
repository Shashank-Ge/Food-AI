const express = require('express');
const router = express.Router();

// Simple health check endpoints - useful for deployment monitoring
router.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

router.get('/test-cloud', (req, res) => {
  res.json({ status: "cloudinary ok" }); 
});

module.exports = router;