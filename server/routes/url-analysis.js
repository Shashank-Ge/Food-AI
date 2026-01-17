const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('../cloudinary');
const analyzeFoodImage = require('../groq');
const Meal = require('../models/Meal');
const axios = require('axios');
const https = require('https');
const http = require('http');

const router = express.Router();

// Create a custom HTTPS agent that ignores SSL certificate errors (for testing)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const httpAgent = new http.Agent({
  keepAlive: true
});

async function downloadImageWithFallback(imageUrl) {
  const methods = [
    // Method 1: Standard axios with full headers
    async () => {
      return await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
        timeout: 15000,
        maxRedirects: 5,
        httpsAgent: httpsAgent,
        httpAgent: httpAgent,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': new URL(imageUrl).origin,
        }
      });
    },
    
    // Method 2: Simple request without special headers
    async () => {
      return await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
        timeout: 10000,
        maxRedirects: 3,
        headers: {
          'User-Agent': 'FoodAnalyzer/1.0'
        }
      });
    },
    
    // Method 3: Basic request
    async () => {
      return await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 8000
      });
    }
  ];

  let lastError;
  
  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Trying download method ${i + 1}...`);
      const response = await methods[i]();
      console.log(`✓ Method ${i + 1} succeeded`);
      return response;
    } catch (error) {
      console.log(`✗ Method ${i + 1} failed:`, error.message);
      lastError = error;
      continue;
    }
  }
  
  throw lastError;
}

router.post('/', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log("=== URL Analysis Request ===");
    console.log("Received URL:", imageUrl);

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    console.log("Analyzing image from URL:", imageUrl);

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (urlError) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Download image from URL
    let imageBuffer;
    let contentType;
    let contentLength;

    try {
      const response = await downloadImageWithFallback(imageUrl);

      imageBuffer = Buffer.from(response.data);
      contentType = response.headers['content-type'];
      contentLength = imageBuffer.length;

      console.log("Downloaded image:", {
        size: contentLength,
        type: contentType
      });

      // Validate it's an image
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({ error: "URL does not point to a valid image" });
      }

      // Check file size (limit to 10MB)
      if (contentLength > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Image too large (max 10MB)" });
      }

    } catch (downloadError) {
      console.error("Failed to download image:", downloadError.message);
      
      // Provide more specific error messages
      let errorMessage = "Failed to download image from URL";
      let errorDetails = downloadError.message;
      
      if (downloadError.code === 'ENOTFOUND') {
        errorMessage = "URL not found or domain doesn't exist";
      } else if (downloadError.code === 'ECONNREFUSED') {
        errorMessage = "Connection refused by server";
      } else if (downloadError.code === 'ETIMEDOUT') {
        errorMessage = "Request timed out - server took too long to respond";
      } else if (downloadError.response?.status === 403) {
        errorMessage = "Access forbidden - website blocks direct image access";
        errorDetails = "Try using a different image URL or upload the image directly";
      } else if (downloadError.response?.status === 404) {
        errorMessage = "Image not found at this URL";
      } else if (downloadError.response?.status >= 400) {
        errorMessage = `Server error (${downloadError.response.status})`;
      }
      
      return res.status(400).json({ 
        error: errorMessage,
        details: errorDetails,
        suggestion: "Try uploading the image directly instead, or use a different image URL"
      });
    }

    // Upload to Cloudinary (optional, for backup/history)
    let finalImageUrl = imageUrl; // Use original URL as fallback
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "food-ai-url" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
        uploadStream.end(imageBuffer);
      });
      
      finalImageUrl = uploadResult.secure_url;
      console.log("✓ Cloudinary backup successful:", finalImageUrl);
    } catch (cloudinaryError) {
      console.error("✗ Cloudinary backup failed:", cloudinaryError.message);
      // Continue with original URL
    }

    // Analyze image with Groq
    const analysis = await analyzeFoodImage(imageBuffer);

    // Return response immediately to user
    res.json({
      message: "URL Analyzed",
      filename: `URL: ${imageUrl}`,
      source_url: imageUrl,
      size: contentLength,
      image_url: finalImageUrl,
      analysis
    });

    // Save to MongoDB asynchronously in background (non-blocking)
    if (mongoose.connection.readyState === 1) {
      Meal.create({
        filename: `URL: ${imageUrl}`,
        food: analysis.food,
        health: analysis.health,
        reason: analysis.reason,
        next_meal: analysis.next_meal,
        size: contentLength,
        image_url: finalImageUrl,
        source_url: imageUrl
      })
      .then(saved => {
        console.log("URL meal saved to MongoDB:", saved._id);
      })
      .catch(err => {
        console.error("MongoDB save error (non-critical):", err.message);
      });
    } else {
      console.log("MongoDB not connected - skipping save");
    }

  } catch (error) {
    console.error("URL analysis error:", error);
    return res.status(500).json({
      error: "Failed to analyze image from URL",
      details: error.message
    });
  }
});

module.exports = router;