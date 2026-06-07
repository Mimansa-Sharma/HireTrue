export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, text } = req.body;

  if (!text || !system) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: text }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || 'API request failed' });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ result });

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
