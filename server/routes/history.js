const express = require('express');
const mongoose = require('mongoose');
const Meal = require('../models/Meal');

const router = express.Router();

// Get meal history
router.get('/', async (req, res) => {
  try {
    // Last 10 meals
    const meals = await Meal.find().sort({ created_at: -1 }).limit(10);
    res.json({ meals })
  } catch (err) {
    console.error("History error:", err.message);
    res.status(500).json({ error: "Failed to fetch History" })
  }
});

// Clear meal history
router.delete('/', async (req, res) => {
  console.log("DELETE /history route hit - attempting to clear history");
  try {
    console.log("MongoDB connection state:", mongoose.connection.readyState);
    
    if (mongoose.connection.readyState === 1) {
      const result = await Meal.deleteMany({});
      console.log("Delete result:", result);
      res.json({ message: "History cleared successfully" });
    } else {
      console.log("Database not connected");
      res.status(500).json({ error: "Database not connected" });
    }
  } catch (err) {
    console.error("Clear history error:", err.message);
    res.status(500).json({ error: "Failed to clear history" });
  }
});

module.exports = router;