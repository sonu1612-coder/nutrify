module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: 'Image is required' });
  }

  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = process.env.NVIDIA_API_KEY;

  const requestBody = {
    model: "meta/llama-3.2-11b-vision-instruct",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this image of food. Identify the primary food item, estimate the serving size in grams, and calculate the approximate nutritional values including vitamins, minerals, and essential BCAAs. Respond ONLY with a valid JSON object in this exact format: {\"name\": \"Food Name\", \"grams\": 100, \"calories\": 250, \"protein\": 10, \"carbs\": 20, \"fat\": 5, \"fiber\": 3, \"sugar\": 5, \"sodium\": 200, \"potassium\": 300, \"calcium\": 50, \"iron\": 2, \"vitaminA\": 100, \"vitaminC\": 10, \"vitaminD\": 0, \"aminoAcids\": {\"leucine\": 0.8, \"isoleucine\": 0.4, \"valine\": 0.5}}. Values can be 0. If you cannot clearly recognize any food in the image, return EXACTLY this JSON: {\"unknown\": true}. Do not include any other text or markdown."
          },
          {
            type: "image_url",
            image_url: {
              url: imageBase64
            }
          }
        ]
      }
    ],
    temperature: 0.2,
    top_p: 0.7,
    max_tokens: 512,
    stream: false
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Nvidia Vision API Error:", response.status, errorData);
      return res.status(response.status).json({ error: `API error: ${response.status}` });
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Clean up markdown block if present
    if (content.startsWith('```json')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (content.startsWith('```')) {
      content = content.replace(/```/g, '').trim();
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return res.status(200).json(parsed);
    } else {
      throw new Error("Invalid JSON from AI");
    }
  } catch (error) {
    console.error("Error calling Nvidia Vision API:", error);
    return res.status(500).json({ error: "Failed to analyze image." });
  }
};
