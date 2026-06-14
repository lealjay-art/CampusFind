/**
 * auth.js
 * CampusFind – Admin Authentication
 * Demonstrates: FormData, async/await, localStorage session
 */

/**
 * Guard admin pages – redirect to login if not authenticated.
 * Call this at the top of any admin page script.
 */
function requireAdminAuth() {
  if (!isAdminLoggedIn()) {
    window.location.href = 'login.html';
  }
}

/**
 * Handle admin login form submission.
 * Demonstrates: FormData API, async/await, Promise error handling
 * @param {Event} e
 */
async function handleLoginSubmit(e) {
  e.preventDefault(); // Prevent default form submission

  const form      = e.target;
  const submitBtn = form.querySelector('[type="submit"]');

  // ── FormData API ────────────────────────────────────
  const formData = new FormData(form);
  const username = formData.get('username')?.trim();
  const password = formData.get('password');

  // Validation
  clearAlert('loginAlert');
  if (!username || !password) {
    showAlert('loginAlert', '⚠️ Please enter your username and password.', 'warning');
    return;
  }

  setButtonLoading(submitBtn, 'Signing in…');
  showLoading('Authenticating…');

  try {
    // async/await: wait for login promise
    await adminLogin(username, password);
    hideLoading();
    showToast('Welcome back, Admin! 👋', 'success');
    // Short delay so toast is visible before redirect
    await new Promise(r => setTimeout(r, 800));
    window.location.href = 'dashboard.html';
  } catch (err) {
    hideLoading();
    setButtonReady(submitBtn);
    showAlert('loginAlert', `❌ ${err.message || 'Login failed. Try again.'}`, 'danger');
  }
}

/**
 * Logout admin and redirect to login.
 */
function handleLogout() {
  adminLogout();
  showToast('You have been signed out.', 'info');
  setTimeout(() => { window.location.href = 'login.html'; }, 600);
}
