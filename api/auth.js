import crypto from 'crypto';

// Simple hash function for passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'lenshr_salt_2025').digest('hex');
}

function generateToken(email) {
  return crypto.createHash('sha256').update(email + Date.now() + 'lenshr_secret').digest('hex');
}

// In-memory store (persists per function instance)
// For production scale we'd use a DB, but this works for early users
const users = {};
const tokens = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (!action) return res.status(400).json({ error: 'Action required' });

  try {
    if (action === 'signup') {
      if (!name) return res.status(400).json({ error: 'Name required' });
      if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

      // Check if already exists
      if (users[email]) return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });

      // Create user
      const hashedPw = hashPassword(password);
      users[email] = { email, name, password: hashedPw, createdAt: Date.now() };

      // Create token
      const token = generateToken(email);
      const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
      tokens[token] = { email, expiresAt };

      return res.status(200).json({
        access_token: token,
        expires_at: expiresAt,
        user: { email, name, id: hashPassword(email).substring(0, 16) }
      });

    } else if (action === 'login') {
      const user = users[email];
      if (!user) return res.status(400).json({ error: 'No account found with this email. Please sign up.' });

      const hashedPw = hashPassword(password);
      if (user.password !== hashedPw) return res.status(400).json({ error: 'Incorrect password. Please try again.' });

      const token = generateToken(email);
      const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
      tokens[token] = { email, expiresAt };

      return res.status(200).json({
        access_token: token,
        expires_at: expiresAt,
        user: { email, name: user.name, id: hashPassword(email).substring(0, 16) }
      });

    } else if (action === 'logout') {
      const token = req.headers['authorization']?.split(' ')[1];
      if (token && tokens[token]) delete tokens[token];
      return res.status(200).json({ success: true });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
