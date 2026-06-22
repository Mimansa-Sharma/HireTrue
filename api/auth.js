export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name } = req.body;
  const SB_URL = 'https://kfbkbblrxpgkpwjdaqg.supabase.co';
  const SB_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SB_KEY) return res.status(500).json({ error: 'SUPABASE_ANON_KEY not set in environment' });

  try {
    let endpoint, body;

    if (action === 'signup') {
      endpoint = `${SB_URL}/auth/v1/signup`;
      body = { email, password, data: { full_name: name } };
    } else if (action === 'login') {
      endpoint = `${SB_URL}/auth/v1/token?grant_type=password`;
      body = { email, password };
    } else if (action === 'logout') {
      const token = req.headers['authorization']?.split(' ')[1];
      await fetch(`${SB_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': SB_KEY }
      });
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`
      },
      body: JSON.stringify(body)
    });

    const rawText = await response.text();
    let data;
    try { data = JSON.parse(rawText); } catch(e) { data = { raw: rawText }; }

    console.log('Supabase status:', response.status);
    console.log('Supabase response:', JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.msg || data.error_description || data.error || `Supabase error ${response.status}`,
        detail: data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.log('Fetch error:', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
