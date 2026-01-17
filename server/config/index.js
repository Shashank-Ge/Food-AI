// I export all config from one place to keep imports clean
module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  // Add other config values as needed
};