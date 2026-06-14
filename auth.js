// ─── Supabase Setup ───────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://kfbkblrxpgkpwjdaqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmtiYmxyeHBna3B3amRhcWciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4MTQyNzU5MiwiZXhwIjoyMDk3MDAzNTkyfQ.5J_olH3CM0R07hrAYByBQi2Dyoinkqpynq_L3ZehLxU';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Free Analysis Limit ─────────────────────────────────────────────────────

const FREE_LIMIT = 3;

function getUsageCount() {
  return parseInt(localStorage.getItem('lenshr_usage') || '0');
}

function incrementUsage() {
  const count = getUsageCount() + 1;
  localStorage.setItem('lenshr_usage', count);
  updateUsageBar(count);
  return count;
}

function updateUsageBar(count) {
  const remaining = Math.max(0, FREE_LIMIT - count);
  const textEl = document.getElementById('usage-text');
  const bar = document.getElementById('usage-bar');

  // Update dots
  for (let i = 1; i <= 3; i++) {
    const dot = document.getElementById('dot-' + i);
    if (dot) dot.classList.toggle('active', i <= remaining);
  }

  if (textEl) {
    if (remaining === 0) {
      textEl.textContent = 'Free analyses used — sign up to continue';
      textEl.style.color = 'var(--red)';
    } else {
      textEl.textContent = remaining + ' free ' + (remaining === 1 ? 'analysis' : 'analyses') + ' remaining';
      textEl.style.color = '';
    }
  }
}

function canAnalyze() {
  const session = sb.auth.getSession();
  // If logged in, always allow
  if (window._lenshrUser) return true;
  // If guest, check limit
  return getUsageCount() < FREE_LIMIT;
}

// ─── Auth State ───────────────────────────────────────────────────────────────

window._lenshrUser = null;

sb.auth.onAuthStateChange((event, session) => {
  window._lenshrUser = session?.user || null;
  updateNavAuth(session?.user);
  if (session?.user) {
    closeAuth();
    // Hide usage bar for logged-in users
    const bar = document.getElementById('usage-bar');
    if (bar) bar.style.display = 'none';
  } else {
    const bar = document.getElementById('usage-bar');
    if (bar) bar.style.display = 'flex';
    updateUsageBar(getUsageCount());
  }
});

function updateNavAuth(user) {
  const authBtns = document.getElementById('nav-auth');
  const userArea = document.getElementById('nav-user');
  const emailEl = document.getElementById('nav-user-email');

  if (user) {
    authBtns.style.display = 'none';
    userArea.style.display = 'flex';
    if (emailEl) emailEl.textContent = user.email;
  } else {
    authBtns.style.display = 'flex';
    userArea.style.display = 'none';
  }
}

// ─── Modal Controls ───────────────────────────────────────────────────────────

function openAuth(mode, showLimitMsg) {
  document.getElementById('auth-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
  switchAuthTab(mode || 'signup');
  const limitMsg = document.getElementById('modal-limit-msg');
  if (limitMsg) limitMsg.style.display = showLimitMsg ? 'block' : 'none';
  clearAuthMessage();
}

function closeAuth() {
  document.getElementById('auth-modal').style.display = 'none';
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('auth-modal');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAuth();
    });
  }
  updateUsageBar(getUsageCount());
});

function switchAuthTab(tab) {
  document.getElementById('auth-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('auth-signup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  clearAuthMessage();
}

function showAuthMessage(msg, isError) {
  const el = document.getElementById('auth-message');
  el.textContent = msg;
  el.style.display = 'block';
  el.style.color = isError ? 'var(--red)' : 'var(--green)';
}

function clearAuthMessage() {
  const el = document.getElementById('auth-message');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

async function signUp() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  if (!name || !email || !password) {
    showAuthMessage('Please fill in all fields.', true); return;
  }
  if (password.length < 6) {
    showAuthMessage('Password must be at least 6 characters.', true); return;
  }

  showAuthMessage('Creating your account...', false);

  const { error } = await sb.auth.signUp({
    email, password,
    options: { data: { full_name: name } }
  });

  if (error) {
    showAuthMessage(error.message, true);
  } else {
    showAuthMessage('Account created! Please check your email to confirm, then log in.', false);
  }
}

// ─── Sign In ─────────────────────────────────────────────────────────────────

async function signIn() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAuthMessage('Please enter your email and password.', true); return;
  }

  showAuthMessage('Logging in...', false);

  const { error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    showAuthMessage(error.message, true);
  } else {
    showAuthMessage('Welcome back!', false);
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

async function signOut() {
  await sb.auth.signOut();
}
