require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

// Import route modules
const uploadRoutes = require('./routes/upload')
const historyRoutes = require('./routes/history')
const testRoutes = require('./routes/test')
const urlAnalysisRoutes = require('./routes/url-analysis')

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s not 30s
  socketTimeoutMS: 45000,
})
.then( () => console.log ("MongoDB connected") )
.catch (err => {
  console.error("MongoDB connection error:", err.message)
  console.log("App continues without database (analysis still works)")
})

const app = express()
app.use(cors())
app.use(express.json())

// Use route modules
app.use('/', testRoutes)
app.use('/upload', uploadRoutes)
app.use('/history', historyRoutes)
app.use('/analyze-url', urlAnalysisRoutes)

app.listen(5000, () => console.log('Server running on port 5000'))