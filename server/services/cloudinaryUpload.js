const { cloudinary } = require('../config/cloudinary');

// I separate Cloudinary operations so they're reusable across routes
const uploadImageBuffer = async (buffer, folder = "food-ai") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Upload with graceful fallback - don't fail the whole request if Cloudinary is down
const uploadWithFallback = async (buffer, folder, fallbackUrl = null) => {
  try {
    const uploadResult = await uploadImageBuffer(buffer, folder);
    console.log("✓ Cloudinary upload successful:", uploadResult.secure_url);
    return uploadResult.secure_url;
  } catch (cloudinaryError) {
    console.error("✗ Cloudinary upload failed:", cloudinaryError.message);
    return fallbackUrl; // Return fallback instead of failing
  }
};

module.exports = { 
  uploadImageBuffer, 
  uploadWithFallback 
};