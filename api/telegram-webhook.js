module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing Supabase credentials in environment");
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const update = req.body;

    // Check if it's a valid message and if it's a reply to another message
    if (update && update.message && update.message.reply_to_message) {
      const originalText = update.message.reply_to_message.text || '';
      const replyText = update.message.text;

      // Extract User ID from the original message text (e.g. "*ID:* 1234-5678-...")
      const idMatch = originalText.match(/ID:\s*([a-zA-Z0-9-]+)/);
      
      if (idMatch && idMatch[1]) {
        const userId = idMatch[1];

        // Insert the admin's reply into the support_messages table via Supabase REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/support_messages`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            user_name: 'Nutrify Support',
            sender: 'admin',
            message: replyText
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Supabase insert error:", errText);
        } else {
          console.log("Successfully inserted admin reply for user:", userId);
        }
      }
    }

    // Always return 200 to Telegram so it doesn't retry
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ status: 'error', message: error.message });
  }
};
