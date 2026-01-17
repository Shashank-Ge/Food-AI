const mongoose = require('mongoose');
const Meal = require('../models/Meal');
const { analyzeFoodImage } = require('../services/aiAnalysis');
const { uploadWithFallback } = require('../services/cloudinaryUpload');
const { downloadImageWithFallback, getDownloadErrorMessage } = require('../services/imageDownload');

// I keep the core analysis logic here so it's reusable between upload and URL routes
const processImageAnalysis = async (imageBuffer, filename, sourceUrl = null) => {
  // Run AI analysis
  const analysis = await analyzeFoodImage(imageBuffer);
  
  // Upload to Cloudinary (with fallback)
  const folder = sourceUrl ? "food-ai-url" : "food-ai-upload";
  const imageUrl = await uploadWithFallback(imageBuffer, folder, sourceUrl);
  
  const result = {
    message: sourceUrl ? "URL Analyzed" : "Image Analyzed",
    filename,
    size: imageBuffer.length,
    image_url: imageUrl,
    analysis
  };
  
  if (sourceUrl) {
    result.source_url = sourceUrl;
  }
  
  // Save to database asynchronously (don't block the response)
  saveMealToDatabase(analysis, filename, imageBuffer.length, imageUrl, sourceUrl);
  
  return result;
};

// Handle URL-based image analysis
const analyzeImageFromUrl = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log("=== URL Analysis Request ===");
    console.log("Received URL:", imageUrl);

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided" });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch (urlError) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Download image from URL
    let imageBuffer;
    let contentType;
    
    try {
      const response = await downloadImageWithFallback(imageUrl);
      imageBuffer = Buffer.from(response.data);
      contentType = response.headers['content-type'];

      console.log("Downloaded image:", {
        size: imageBuffer.length,
        type: contentType
      });

      // Validate it's actually an image
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({ error: "URL does not point to a valid image" });
      }

      // Check file size (10MB limit)
      if (imageBuffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Image too large (max 10MB)" });
      }

    } catch (downloadError) {
      console.error("Failed to download image:", downloadError.message);
      
      const { errorMessage, errorDetails } = getDownloadErrorMessage(downloadError);
      
      return res.status(400).json({ 
        error: errorMessage,
        details: errorDetails,
        suggestion: "Try uploading the image directly instead, or use a different image URL"
      });
    }

    // Process the analysis
    const result = await processImageAnalysis(
      imageBuffer, 
      `URL: ${imageUrl}`, 
      imageUrl
    );
    
    res.json(result);

  } catch (error) {
    console.error("URL analysis error:", error);
    return res.status(500).json({
      error: "Failed to analyze image from URL",
      details: error.message
    });
  }
};

// Handle file upload analysis
const analyzeUploadedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("=== File Upload Analysis ===");
    console.log("File received:", {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Process the analysis
    const result = await processImageAnalysis(
      req.file.buffer,
      req.file.originalname
    );
    
    res.json(result);

  } catch (error) {
    console.error("Upload analysis error:", error);
    return res.status(500).json({
      error: "Failed to analyze uploaded image",
      details: error.message
    });
  }
};

// I keep database operations separate and async to not block responses
const saveMealToDatabase = async (analysis, filename, size, imageUrl, sourceUrl = null) => {
  if (mongoose.connection.readyState !== 1) {
    console.log("MongoDB not connected - skipping save");
    return;
  }

  try {
    const mealData = {
      filename,
      food: analysis.food,
      health: analysis.health,
      reason: analysis.reason,
      next_meal: analysis.next_meal,
      size,
      image_url: imageUrl
    };

    if (sourceUrl) {
      mealData.source_url = sourceUrl;
    }

    const saved = await Meal.create(mealData);
    console.log("Meal saved to MongoDB:", saved._id);
  } catch (err) {
    console.error("MongoDB save error (non-critical):", err.message);
  }
};

module.exports = {
  analyzeImageFromUrl,
  analyzeUploadedImage
};