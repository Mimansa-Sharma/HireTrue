// ─── LensHR Auth — Direct REST API (no SDK dependency) ───────────────────────

const SB_URL = 'https://kfbkkblrxpgkzpwjdaqg.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmYmtrYmxyeHBna3pwd2pkYXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjc1OTIsImV4cCI6MjA5NzAwMzU5Mn0.5J_olH3CM0R07hrAYByBQi2Dyoinkqpynq_L3ZehLxU';

window._lenshrUser = null;
window._selectedRole = 'candidate';
const isDashboard = window.location.pathname.toLowerCase().includes('dashboard');

function setSignUpRole(role) {
  window._selectedRole = role;
  const btnCandidate = document.getElementById('role-candidate');
  const btnHr = document.getElementById('role-hr');
  if (btnCandidate) btnCandidate.classList.toggle('active', role === 'candidate');
  if (btnHr) btnHr.classList.toggle('active', role === 'hr');
}

// ─── Session Management ───────────────────────────────────────────────────────

function saveSession(session) {
  if (session) {
    localStorage.setItem('lenshr_token', session.access_token);
    localStorage.setItem('lenshr_user', JSON.stringify(session.user));
    
    // Calculate expiration timestamp if not explicitly provided (REST API returns expires_in)
    const expiresAt = session.expires_at || (Math.floor(Date.now() / 1000) + (session.expires_in || 3600));
    localStorage.setItem('lenshr_expires', expiresAt);
    
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

// ─── Parse Hash Auth (for email confirmation redirect) ───────────────────────

async function handleHashAuth() {
  if (!window.location.hash) return;
  
  // Parse hash (handle both #access_token=... and #/access_token=...)
  let hashStr = window.location.hash.substring(1);
  if (hashStr.startsWith('/')) hashStr = hashStr.substring(1);
  
  const params = new URLSearchParams(hashStr);
  const access_token = params.get('access_token');
  const expires_in = params.get('expires_in');
  
  if (access_token) {
    try {
      // Fetch user details from Supabase using the access token
      const res = await fetch(`${SB_URL}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${access_token}`
        }
      });
      if (res.ok) {
        const user = await res.ok ? await res.json() : null;
        if (user) {
          const session = {
            access_token,
            user,
            expires_in: expires_in ? parseInt(expires_in) : 3600
          };
          saveSession(session);
          // Clear hash from URL without reloading page
          window.history.replaceState(null, null, window.location.pathname);
        }
      }
    } catch (e) {
      console.error('Failed to authenticate via redirect hash:', e);
    }
  }
}

// ─── On Page Load ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Handle email confirmation redirects automatically
  await handleHashAuth();

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
      applyRoleRestrictions(user);
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

function applyRoleRestrictions(user) {
  // Read role from user metadata. Default to candidate if not set.
  const role = (user.user_metadata && user.user_metadata.role) || 'candidate';
  
  const linkJd = document.querySelector('.sidebar-link[data-tool="jd"]');
  const linkOffer = document.querySelector('.sidebar-link[data-tool="offer"]');
  const linkPolicy = document.querySelector('.sidebar-link[data-tool="policy"]');
  const linkResume = document.querySelector('.sidebar-link[data-tool="resume"]');
  
  const panelJd = document.getElementById('panel-jd');
  const panelOffer = document.getElementById('panel-offer');
  const panelPolicy = document.getElementById('panel-policy');
  const panelResume = document.getElementById('panel-resume');
  
  if (role === 'candidate') {
    if (linkJd) linkJd.style.display = 'none';
    if (linkOffer) linkOffer.style.display = 'flex';
    if (linkPolicy) linkPolicy.style.display = 'flex';
    if (linkResume) linkResume.style.display = 'flex';
  } else if (role === 'hr') {
    if (linkOffer) linkOffer.style.display = 'none';
    if (linkResume) linkResume.style.display = 'none';
    if (linkJd) linkJd.style.display = 'flex';
    if (linkPolicy) linkPolicy.style.display = 'flex';
  }
  
  // Ensure the active tab is visible. If not, switch to the first visible one.
  const sidebarLinks = Array.from(document.querySelectorAll('.sidebar-link'));
  const activeLink = sidebarLinks.find(l => l.classList.contains('active'));
  
  if (activeLink && activeLink.style.display === 'none') {
    activeLink.classList.remove('active');
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    
    const visibleLink = sidebarLinks.find(l => l.style.display !== 'none');
    if (visibleLink) {
      visibleLink.classList.add('active');
      const tool = visibleLink.dataset.tool;
      const panel = document.getElementById('panel-' + tool);
      if (panel) panel.classList.add('active');
      
      const title = (typeof TOOL_META !== 'undefined' ? TOOL_META[tool].title : visibleLink.textContent.trim());
      const subtitle = (typeof TOOL_META !== 'undefined' ? TOOL_META[tool].subtitle : '');
      document.getElementById('dash-title').textContent = title;
      document.getElementById('dash-subtitle').textContent = subtitle;
    }
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

// ─── Sign Up ─────────────────────────────────────────────────────────────────

async function signUp() {
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const password = document.getElementById('signup-password')?.value;
  const role = window._selectedRole || 'candidate';
  if (!name || !email || !password) { showAuthMessage('Please fill in all fields.', true); return; }
  if (password.length < 6) { showAuthMessage('Password must be at least 6 characters.', true); return; }
  showAuthMessage('Creating your account...', false);
  try {
    const res = await fetch(`${SB_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY },
      body: JSON.stringify({ email, password, data: { full_name: name, role: role } })
    });
    const data = await res.json();
    if (!res.ok) { showAuthMessage(data.msg || data.error_description || 'Signup failed.', true); return; }
    
    // Auto-login if email confirmation is disabled (standard GoTrue response format)
    if (data.access_token) {
      saveSession(data);
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
