const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cloudinary = require('../cloudinary');
const analyzeFoodImage = require('../groq');
const Meal = require('../models/Meal');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" })
    }

    console.log("Received File:", req.file.originalname)
    console.log("Size:", req.file.size, "bytes")
    console.log("MIME Type:", req.file.mimetype)

    // Upload to Cloudinary
    let finalImageUrl = null;
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "food-ai" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      
      finalImageUrl = uploadResult.secure_url;
      console.log("✓ Cloudinary upload successful:", finalImageUrl);
    } catch (cloudinaryError) {
      console.error("✗ Cloudinary upload failed:", cloudinaryError.message);
    }

    // Sending image to Groq for analysis
    const analysis = await analyzeFoodImage(req.file.buffer)

    // Return response immediately to user
    res.json({
      message: "Analyzed",
      filename: req.file.originalname,
      size: req.file.size,
      image_url: finalImageUrl,
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
        image_url: finalImageUrl
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
});

module.exports = router;