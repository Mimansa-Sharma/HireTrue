// ─── LensHR Auth — Direct REST API (no SDK dependency) ───────────────────────

const SB_URL = 'https://kfbkbblrxpgkpwjdaqg.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmtiYmxyeHBna3B3amRhcWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4MTQyNzU5MiwiZXhwIjoyMDk3MDAzNTkyfQ.5J_olH3CM0R07hrAYByBQi2Dyoinkqpynq_L3ZehLxU';

window._lenshrUser = null;
const isDashboard = window.location.pathname.toLowerCase().includes('dashboard');

// ─── Session Management ───────────────────────────────────────────────────────

function saveSession(session) {
  if (session) {
    localStorage.setItem('lenshr_token', session.access_token);
    localStorage.setItem('lenshr_user', JSON.stringify(session.user));
    localStorage.setItem('lenshr_expires', session.expires_at);
    window._lenshrUser = session.user;
  } else {
    localStorage.removeItem('lenshr_token');
    localStorage.removeItem('lenshr_user');
    localStorage.removeItem('lenshr_expires');
    window._lenshrUser = null;
  }
}

function getStoredUser() {
  try {
    const token = localStorage.getItem('lenshr_token');
    const user = localStorage.getItem('lenshr_user');
    const expires = localStorage.getItem('lenshr_expires');
    if (!token || !user || !expires) return null;
    if (Date.now() / 1000 > parseInt(expires)) { saveSession(null); return null; }
    return JSON.parse(user);
  } catch(e) { return null; }
}

// ─── On Page Load ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const user = getStoredUser();
  window._lenshrUser = user;

  if (isDashboard) {
    const gate = document.getElementById('guest-gate');
    const wrap = document.getElementById('dash-wrap');
    if (user) {
      if (gate) gate.style.display = 'none';
      if (wrap) wrap.style.display = 'flex';
      const emailEl = document.getElementById('sidebar-email');
      const avatarEl = document.getElementById('sidebar-avatar');
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) avatarEl.textContent = user.email[0].toUpperCase();
    } else {
      if (gate) gate.style.display = 'flex';
      if (wrap) wrap.style.display = 'none';
    }
  } else {
    updateNavAuth(user);
    // Close modal overlay click
    const overlay = document.getElementById('auth-modal');
    if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeAuth(); });
  }
});

function updateNavAuth(user) {
  const authBtns = document.getElementById('nav-auth');
  const userArea = document.getElementById('nav-user');
  if (user) {
    if (authBtns) authBtns.style.display = 'none';
    if (userArea) userArea.style.display = 'flex';
  } else {
    if (authBtns) authBtns.style.display = 'flex';
    if (userArea) userArea.style.display = 'none';
  }
}

// ─── Usage Limit (guests) ─────────────────────────────────────────────────────

function getUsageCount() { return parseInt(localStorage.getItem('lenshr_usage') || '0'); }
function incrementUsage() {
  const c = getUsageCount() + 1;
  localStorage.setItem('lenshr_usage', c);
  return c;
}

// ─── Modal Controls ───────────────────────────────────────────────────────────

function openAuth(mode, showLimitMsg) {
  const modal = document.getElementById('auth-modal');
  if (!modal) { window.location.href = 'index.html'; return; }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  switchAuthTab(mode || 'signup');
  const limitMsg = document.getElementById('modal-limit-msg');
  if (limitMsg) limitMsg.style.display = showLimitMsg ? 'block' : 'none';
  clearAuthMessage();
}

function closeAuth() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  const loginEl = document.getElementById('auth-login');
  const signupEl = document.getElementById('auth-signup');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  if (loginEl) loginEl.style.display = tab === 'login' ? 'block' : 'none';
  if (signupEl) signupEl.style.display = tab === 'signup' ? 'block' : 'none';
  if (tabLogin) tabLogin.classList.toggle('active', tab === 'login');
  if (tabSignup) tabSignup.classList.toggle('active', tab === 'signup');
  clearAuthMessage();
}

function showAuthMessage(msg, isError) {
  const el = document.getElementById('auth-message');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = isError ? '#FF5A5A' : '#00C48C';
}

function clearAuthMessage() {
  const el = document.getElementById('auth-message');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

async function signUp() {
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const password = document.getElementById('signup-password')?.value;
  if (!name || !email || !password) { showAuthMessage('Please fill in all fields.', true); return; }
  if (password.length < 6) { showAuthMessage('Password must be at least 6 characters.', true); return; }
  showAuthMessage('Creating your account...', false);
  try {
    const res = await fetch(`${SB_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
      body: JSON.stringify({ email, password, data: { full_name: name } })
    });
    const data = await res.json();
    if (!res.ok) { showAuthMessage(data.msg || data.error_description || 'Signup failed.', true); return; }
    if (data.session) {
      saveSession(data.session);
      showAuthMessage('Account created! Taking you to your dashboard...', false);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } else {
      showAuthMessage('Account created! Please check your email to confirm.', false);
    }
  } catch(e) {
    showAuthMessage('Connection error. Please check your internet and try again.', true);
  }
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

async function signIn() {
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  if (!email || !password) { showAuthMessage('Please enter your email and password.', true); return; }
  showAuthMessage('Logging in...', false);
  try {
    const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { showAuthMessage(data.error_description || 'Login failed. Check your credentials.', true); return; }
    saveSession(data);
    showAuthMessage('Welcome back! Taking you to your dashboard...', false);
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
  } catch(e) {
    showAuthMessage('Connection error. Please check your internet and try again.', true);
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

async function signOut() {
  const token = localStorage.getItem('lenshr_token');
  try {
    await fetch(`${SB_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SB_KEY }
    });
  } catch(e) {}
  saveSession(null);
  window.location.href = 'index.html';
}
