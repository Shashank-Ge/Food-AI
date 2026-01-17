const cloudinary = require('cloudinary').v2;

// I centralize Cloudinary config here so it's easy to modify
const initializeCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  // Cloudinary configuration loaded

  cloudinary.config(config);
  return cloudinary;
};

module.exports = { initializeCloudinary, cloudinary };