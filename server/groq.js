const Groq = require("groq-sdk");
const sharp = require("sharp");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

async function analyzeFoodImage(buffer) {
  // Convert any image format (including AVIF) to JPEG for Groq compatibility
  const jpegBuffer = await sharp(buffer)
    .jpeg({ quality: 85 })
    .toBuffer();
  
  const base64 = bufferToBase64(jpegBuffer);

  const prompt = `You are a nutrition expert. Identify the food in the image and return JSON ONLY in this exact format:
{
 "food": "name of the food",
 "health": "healthy or moderate or unhealthy or uncertain",
 "reason": "brief explanation",
 "next_meal": "suggestion for next meal"
}`;

  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            },
            {
              type: "text",
              text: prompt
            }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    let raw = response.choices[0].message.content.trim();
    console.log("Raw Groq response:", raw);
    
    // Remove markdown code blocks if present
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    return JSON.parse(raw);

  } catch (err) {
    console.error("Groq Vision error:", err);
    console.error("Error details:", err.message);
    return {
      food: "unknown",
      health: "uncertain",
      reason: `API error: ${err.message}`,
      next_meal: "Try uploading a clearer image"
    };
  }
}

module.exports = analyzeFoodImage;
