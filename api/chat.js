module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { messages } = req.body;
  if (!messages) {
    return res.status(400).json({ error: 'Messages are required' });
  }

  // Basic in-memory rate limiting for Vercel
  if (!global.rateLimitCache) {
    global.rateLimitCache = new Map();
  }
  
  // Vercel populates x-forwarded-for for client IP
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Cleanup old entries
  for (const [key, val] of global.rateLimitCache.entries()) {
    if (now - val.startTime > 24 * 60 * 60 * 1000) {
      global.rateLimitCache.delete(key);
    }
  }

  const userRecord = global.rateLimitCache.get(ip) || { count: 0, startTime: now };
  if (now - userRecord.startTime > 24 * 60 * 60 * 1000) {
    userRecord.count = 0;
    userRecord.startTime = now;
  }
  
  if (userRecord.count >= 100) {
    return res.status(429).json({ error: 'Too many requests. You have reached your limit of 100 messages per day. Please try again tomorrow.' });
  }
  
  userRecord.count++;
  global.rateLimitCache.set(ip, userRecord);

  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = process.env.NVIDIA_API_KEY;

  const requestBody = {
    model: "nvidia/nemotron-3-nano-30b-a3b",
    messages: messages,
    temperature: 0.7,
    top_p: 1,
    max_tokens: 1024, 
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
      console.error("Nvidia API Error:", response.status, errorData);
      return res.status(response.status).json({ error: `API error: ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling Nvidia API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
