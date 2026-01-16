//temprorary code 
console.log("Cloudinary config:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY ? "FOUND" : "MISSING",
  secret: process.env.CLOUDINARY_API_SECRET ? "FOUND" : "MISSING"
});


require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require ('multer')
const upload = multer ( { storage : multer.memoryStorage() })
const analyzeFoodImage = require("./groq")
const mongoose = require ('mongoose')
const Meal = require ("./models/Meal");
const cloudinary = require("./cloudinary");



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

app.get('/', (req, res) => {
  res.json({ message: 'Hello from backend' })
})



app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image received" })
    }

    console.log("Received File:", req.file.originalname)
    console.log("Size:", req.file.size, "bytes")
    console.log("MIME Type:", req.file.mimetype)

    // Upload image buffer to Cloudinary
    let uploadResult;
    try {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "food-ai" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      uploadResult = await uploadPromise;
      console.log("✓ Cloudinary upload successful:", uploadResult.secure_url);
    } catch (cloudinaryError) {
      console.error("✗ Cloudinary upload failed:", cloudinaryError.message);
      // Continue without image URL if Cloudinary fails
      uploadResult = { secure_url: null };
    }


    // Sending image to Groq for analysis
    const analysis = await analyzeFoodImage(req.file.buffer)

    // Return response immediately to user
    res.json({
      message: "Analyzed",
      filename: req.file.originalname,
      size: req.file.size,
      image_url : uploadResult.secure_url,
      analysis
    })

    // Saving to MongoDB asynchronously in background (non-blocking)
    // if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      Meal.create({
        filename: req.file.originalname,
        food: analysis.food,
        health: analysis.health,
        reason: analysis.reason,
        next_meal: analysis.next_meal,
        size: req.file.size,
        image_url: uploadResult.secure_url
      })
      .then(saved => {
        console.log("Meal saved to MongoDB:", saved._id)
      })
      .catch(err => {
        console.error("MongoDB save error (non-critical):", err.message)
      })
    } else {
      console.log("MongoDB not connected - skipping save")
    }

  } catch (error) {
    console.error("Upload error:", error)
    return res.status(500).json({
      error: "Failed to process image",
      details: error.message
    })
  }
})


app.get ('/history' , async (req,res) => {
  try {
    const Meal = require ("./models/Meal");

    //last 10 meals
    const meals = await Meal.find().sort({ created_at: -1 }).limit(10);

    res.json ({meals})

  }catch (err) {
    console.error ("History error: ", err.message);
    res.status(500).json({ error: "Failed to fetch History" })
  }
});

app.get('/test-cloud',(req,res) => {
  res.json({ status: "cloudinary ok" }); 
});





app.listen(5000, () => console.log('Server running on port 5000'))
