export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name } = req.body;
  const SB_URL = 'https://kfbkbblrxpgkpwjdaqg.supabase.co';
  const SB_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SB_KEY) return res.status(500).json({ error: 'Supabase key not configured' });

  try {
    let endpoint, body;

    if (action === 'signup') {
      endpoint = `${SB_URL}/auth/v1/signup`;
      body = { email, password, data: { full_name: name } };
    } else if (action === 'login') {
      endpoint = `${SB_URL}/auth/v1/token?grant_type=password`;
      body = { email, password };
    } else if (action === 'logout') {
      endpoint = `${SB_URL}/auth/v1/logout`;
      const token = req.headers['authorization']?.split(' ')[1];
      const logoutRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': SB_KEY }
      });
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.msg || data.error_description || data.error || 'Authentication failed'
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
