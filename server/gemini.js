const fetch = require ("node-fetch")



// buffer to base 64
function bufferToBase64 (buffer) {
    return buffer.toString('base64') ;
}

async function analyzeFoodImage ( buffer, mimeType = "image/jpeg" ) {
    const apiKey = process.env.GEMINI_API_KEY
    const base64 = bufferToBase64(buffer)

    const payload = {
        contents :[
            {
                role : "user",
                parts : [
                    {
                        inlineData : {
                            mimeType ,
                            data : base64
                        }
                    },
                    {
                        text : `
                        Act as a nutrition assistant
                        Return only JSON to prose :
                        {
                        "food" : "name of food or best guess",
                        "health" : " healthy | moderate | unhealthy | uncertain ",
                        "reason" : " 1 sentence why"
                        "next_meal" : "short suggestion"
                        }
                        `
                    }
                ]
            }
        ]
    };

    try {
        const res = await fetch (
            "https://generativelanguages.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + apiKey,
            {
                method : "POST",
                headers : { "Content-type": "application/json" },
                body : JSON.stringify(payload)
            }
        );

        const data = await res.json() ;

        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}" ;
        text = text.replace(/```json|```/g, "").trim();

        return JSON.parse(text);

    } catch (error) {
        console.error ("Gemini REST error FULL:", JSON.stringify(error, null, 2));
        return {
            food : "unknown",
            health : "uncertain",
            reason : "API call failed" ,
            next_meal : "drink water"
        };
    }
}

module.exports = analyzeFoodImage ;