// ─── Supabase Setup ───────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://kfbkbblrxpgkpwjdaqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmtiYmxyeHBna3B3amRhcWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4MTQyNzU5MiwiZXhwIjoyMDk3MDAzNTkyfQ.5J_olH3CM0R07hrAYByBQi2Dyoinkqpynq_L3ZehLxU';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window._lenshrUser = null;
const isDashboard = window.location.pathname.includes('dashboard');

// ─── Auth State ───────────────────────────────────────────────────────────────

sb.auth.onAuthStateChange((event, session) => {
  window._lenshrUser = session?.user || null;

  if (isDashboard) {
    const gate = document.getElementById('guest-gate');
    const wrap = document.getElementById('dash-wrap');
    if (session?.user) {
      if (gate) gate.style.display = 'none';
      if (wrap) wrap.style.display = 'flex';
      const emailEl = document.getElementById('sidebar-email');
      const avatarEl = document.getElementById('sidebar-avatar');
      if (emailEl) emailEl.textContent = session.user.email;
      if (avatarEl) avatarEl.textContent = session.user.email[0].toUpperCase();
    } else {
      if (gate) gate.style.display = 'flex';
      if (wrap) wrap.style.display = 'none';
    }
  } else {
    updateNavAuth(session?.user);
    if (event === 'SIGNED_IN' && session?.user) {
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    }
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
  const count = getUsageCount() + 1;
  localStorage.setItem('lenshr_usage', count);
  return count;
}

// ─── Modal Controls ───────────────────────────────────────────────────────────

function openAuth(mode, showLimitMsg) {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
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

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('auth-modal');
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeAuth(); });
});

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
  const { error } = await sb.auth.signUp({ email, password, options: { data: { full_name: name } } });
  if (error) { showAuthMessage(error.message, true); }
  else { showAuthMessage('Account created! Check your email to confirm, then log in.', false); }
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

async function signIn() {
  const email = document.getElementById('login-email')?.value?.trim();
  const password = document.getElementById('login-password')?.value;
  if (!email || !password) { showAuthMessage('Please enter your email and password.', true); return; }
  showAuthMessage('Logging in...', false);
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { showAuthMessage(error.message, true); }
  else { showAuthMessage('Welcome back! Taking you to your dashboard...', false); }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

async function signOut() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}
