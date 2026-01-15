const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

async function analyzeFoodImage(buffer) {
  const base64 = bufferToBase64(buffer);

  const prompt = `
You are a nutrition expert.
Identify the food in the image and return JSON ONLY:
{
 "food": "",
 "health": "healthy | moderate | unhealthy | uncertain",
 "reason": "",
 "next_meal": ""
}
`;

  try {
    const response = await client.chat.completions.create({
      model: "llava-v1.6-34b",
      messages: [
        { role: "system", content: prompt },
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
              text: "Analyze this food and respond in JSON only."
            }
          ]
        }
      ],
      temperature: 0.2
    });

    let raw = response.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "");
    return JSON.parse(raw);

  } catch (err) {
    console.error("Groq OCR error:", err.message);
    return {
      food: "unknown",
      health: "uncertain",
      reason: "OCR failed",
      next_meal: "drink water"
    };
  }
}

module.exports = analyzeFoodImage;
