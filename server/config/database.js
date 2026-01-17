const mongoose = require('mongoose');

// I keep the DB connection logic separate so it's reusable and testable
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast instead of hanging
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('App continues without database (analysis still works)');
    // Don't exit - the app can work without DB for analysis
  }
};

module.exports = { connectDatabase };