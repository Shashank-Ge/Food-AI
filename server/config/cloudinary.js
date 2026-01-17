const cloudinary = require('cloudinary').v2;

// I centralize Cloudinary config here so it's easy to modify
const initializeCloudinary = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  };

  // Log config status for debugging (without exposing secrets)
  console.log('Cloudinary config:', {
    cloud: config.cloud_name || 'MISSING',
    key: config.api_key ? 'SET' : 'MISSING',
    secret: config.api_secret ? 'SET' : 'MISSING'
  });

  cloudinary.config(config);
  return cloudinary;
};

module.exports = { initializeCloudinary, cloudinary };