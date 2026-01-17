require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import configuration and setup
const { PORT } = require('./config');
const { connectDatabase } = require('./config/database');
const { initializeCloudinary } = require('./config/cloudinary');

// Import route modules
const uploadRoutes = require('./routes/upload');
const historyRoutes = require('./routes/history');
const testRoutes = require('./routes/test');
const urlAnalysisRoutes = require('./routes/url-analysis');

// Initialize external services
connectDatabase();
initializeCloudinary();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Route setup - I keep this organized and easy to read
app.use('/', testRoutes);
app.use('/upload', uploadRoutes);
app.use('/history', historyRoutes);
app.use('/analyze-url', urlAnalysisRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});