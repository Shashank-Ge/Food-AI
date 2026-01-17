const Groq = require("groq-sdk");
const sharp = require("sharp");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// I keep this separate from the main logic for easier testing
const bufferToBase64 = (buffer) => {
  return buffer.toString("base64");
};

// Main AI analysis function - this is where the magic happens
const analyzeFoodImage = async (buffer) => {
  try {
    // Convert any image format to JPEG for Groq compatibility
    // Sharp handles AVIF, WebP, etc. that Groq might not like
    const jpegBuffer = await sharp(buffer)
      .jpeg({ quality: 85 })
      .toBuffer();
    
    const base64 = bufferToBase64(jpegBuffer);

    // I keep the prompt concise but specific to get consistent results
    const prompt = `
You are a professional nutritionist.

Analyze the food shown in the image and respond ONLY in valid JSON.

Rules:
- Be practical and common-sense, not extreme.
- Do NOT give medical advice.
- Assume a general healthy adult.
- Keep advice short, actionable, and realistic.

Return JSON strictly in this format:
{
  "food": "identified food name",
  "health": "healthy | moderate | unhealthy | uncertain",
  "reason": "1–2 sentences explaining why",
  "nutritionist_advice": "what to improve or watch out for",
  "next_meal": "simple suggestion for the next meal to balance this"
}`;

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
      temperature: 0.2, // Low temperature for consistent results
      max_tokens: 500
    });

    let raw = response.choices[0].message.content.trim();
    console.log("Raw Groq response:", raw);
    
    // Clean up markdown formatting that sometimes appears
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    return JSON.parse(raw);

  } catch (err) {
    console.error("Groq Vision error:", err);
    
    // Return a safe fallback instead of crashing
    return {
      food: "unknown",
      health: "uncertain",
      reason: `Analysis failed: ${err.message}`,
      nutritionist_advice: "Unable to analyze this image",
      next_meal: "Try uploading a clearer image"
    };
  }
};

module.exports = { analyzeFoodImage };