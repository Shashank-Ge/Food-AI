const axios = require('axios');
const https = require('https');
const http = require('http');

// I create custom agents to handle different connection scenarios
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // For testing - in production you'd want this true
});

const httpAgent = new http.Agent({
  keepAlive: true
});

// Multiple download strategies because different sites have different restrictions
const downloadImageWithFallback = async (imageUrl) => {
  const methods = [
    // Method 1: Full browser simulation
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
    
    // Method 2: Simple app identification
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
    
    // Method 3: Bare minimum request
    async () => {
      return await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 8000
      });
    }
  ];

  let lastError;
  
  // Try each method until one works
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
};

// I extract error handling logic to keep the main function clean
const getDownloadErrorMessage = (error) => {
  let errorMessage = "Failed to download image from URL";
  let errorDetails = error.message;
  
  if (error.code === 'ENOTFOUND') {
    errorMessage = "URL not found or domain doesn't exist";
  } else if (error.code === 'ECONNREFUSED') {
    errorMessage = "Connection refused by server";
  } else if (error.code === 'ETIMEDOUT') {
    errorMessage = "Request timed out - server took too long to respond";
  } else if (error.response?.status === 403) {
    errorMessage = "Access forbidden - website blocks direct image access";
    errorDetails = "Try using a different image URL or upload the image directly";
  } else if (error.response?.status === 404) {
    errorMessage = "Image not found at this URL";
  } else if (error.response?.status >= 400) {
    errorMessage = `Server error (${error.response.status})`;
  }
  
  return { errorMessage, errorDetails };
};

module.exports = { 
  downloadImageWithFallback, 
  getDownloadErrorMessage 
};