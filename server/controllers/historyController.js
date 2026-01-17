const mongoose = require('mongoose');
const Meal = require('../models/Meal');

// Get meal history with proper error handling
const getMealHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ 
        meals: [], 
        message: "Database not connected" 
      });
    }

    // Get recent meals, newest first
    const meals = await Meal.find()
      .sort({ created_at: -1 })
      .limit(50); // Reasonable limit to avoid huge responses

    res.json({ meals });
  } catch (error) {
    console.error("Error fetching meal history:", error);
    res.status(500).json({ 
      error: "Failed to fetch meal history",
      meals: [] // Return empty array as fallback
    });
  }
};

// Clear all meal history
const clearMealHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        error: "Database not connected" 
      });
    }

    const result = await Meal.deleteMany({});
    console.log(`Cleared ${result.deletedCount} meals from history`);
    
    res.json({ 
      message: "History cleared successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error clearing meal history:", error);
    res.status(500).json({ 
      error: "Failed to clear meal history" 
    });
  }
};

module.exports = {
  getMealHistory,
  clearMealHistory
};