module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { foodName } = req.body;
  if (!foodName) {
    return res.status(400).json({ error: 'Food name is required' });
  }

  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = process.env.NVIDIA_API_KEY;

  const requestBody = {
    model: "nvidia/nemotron-3-nano-30b-a3b",
    messages: [
      {
        role: "user",
        content: `You are a nutrition database. Provide the estimated nutritional values for 100 grams of "${foodName}". Respond ONLY with a valid JSON object in this exact format: {"name": "${foodName}", "grams": 100, "calories": 250, "protein": 10, "carbs": 20, "fat": 5}. Do not include any other text, markdown formatting, or explanation. Just the JSON object.`
      }
    ],
    temperature: 0.1,
    top_p: 1.0,
    max_tokens: 256,
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
      console.error("Nvidia Nutrition API Error:", response.status, errorData);
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
    console.error("Error calling Nvidia Nutrition API:", error);
    return res.status(500).json({ error: "Failed to fetch nutrition data." });
  }
};
