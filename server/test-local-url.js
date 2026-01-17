// Test script to verify URL analysis works with local/accessible URLs
const express = require('express');
const path = require('path');

// Create a simple static file server for testing
const testApp = express();
const testPort = 3001;

// Serve static files from a test directory
testApp.use('/test-images', express.static(path.join(__dirname, 'test-images')));

// Create a simple test image endpoint
testApp.get('/test-image', (req, res) => {
  // Send a simple colored rectangle as PNG
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  
  const width = 400;
  const height = 300;
  const canvasElement = createCanvas(width, height);
  const ctx = canvasElement.getContext('2d');
  
  // Draw a simple food-like image
  ctx.fillStyle = '#8B4513'; // Brown background (bread-like)
  ctx.fillRect(0, 0, width, height);
  
  ctx.fillStyle = '#FF6347'; // Tomato red
  ctx.fillRect(50, 50, 100, 100);
  
  ctx.fillStyle = '#32CD32'; // Lime green (lettuce)
  ctx.fillRect(200, 50, 100, 100);
  
  ctx.fillStyle = '#FFD700'; // Gold (cheese)
  ctx.fillRect(125, 175, 150, 75);
  
  // Add text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px Arial';
  ctx.fillText('Test Sandwich', 120, 280);
  
  const buffer = canvasElement.toBuffer('image/png');
  res.set('Content-Type', 'image/png');
  res.send(buffer);
});

testApp.listen(testPort, () => {
  console.log(`Test image server running on http://localhost:${testPort}`);
  console.log(`Test image available at: http://localhost:${testPort}/test-image`);
  
  // Test the URL analysis with local image
  setTimeout(async () => {
    try {
      const response = await fetch('http://localhost:5000/analyze-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          imageUrl: `http://localhost:${testPort}/test-image` 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Local URL Analysis Success!");
        console.log("Food:", data.analysis.food);
        console.log("Health:", data.analysis.health);
      } else {
        console.log("❌ Local URL Analysis Failed:", data.error);
      }
    } catch (error) {
      console.log("❌ Test Error:", error.message);
    }
  }, 2000);
});