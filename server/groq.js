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

  const prompt =`
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
}
`;

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
