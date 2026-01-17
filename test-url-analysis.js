// Simple test script for URL analysis feature
const testImageUrl = "https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Test+Food"; // Simple placeholder

async function testUrlAnalysis() {
  try {
    console.log("Testing URL analysis with:", testImageUrl);
    
    const response = await fetch('http://localhost:5000/analyze-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl: testImageUrl })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ URL Analysis Success!");
      console.log("Food:", data.analysis.food);
      console.log("Health:", data.analysis.health);
      console.log("Reason:", data.analysis.reason);
    } else {
      console.log("❌ URL Analysis Failed:", data.error);
      console.log("Details:", data.details);
    }
  } catch (error) {
    console.log("❌ Network Error:", error.message);
    console.log("Make sure the server is running on port 5000");
  }
}

// Run test if server is available
testUrlAnalysis();