/**
 * ui.js
 * CampusFind – UI Utility Functions
 * Loading spinners, toast notifications, error alerts, helpers
 */

// ─── Loading Overlay ──────────────────────────────────────────────────────────

/**
 * Show full-page loading overlay.
 * @param {string} message
 */
function showLoading(message = 'Loading…') {
  let overlay = document.getElementById('cfLoadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cfLoadingOverlay';
    overlay.className = 'cf-loading-overlay';
    overlay.innerHTML = `
      <div class="cf-spinner"></div>
      <p id="cfLoadingMsg">${message}</p>
    `;
    document.body.appendChild(overlay);
  } else {
    document.getElementById('cfLoadingMsg').textContent = message;
    overlay.style.display = 'flex';
  }
}

/** Hide the loading overlay. */
function hideLoading() {
  const overlay = document.getElementById('cfLoadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ─── Toast Notifications ──────────────────────────────────────────────────────

let toastContainer;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'cf-toast-container';
    toastContainer.id = 'cfToastContainer';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration  ms before auto-dismiss
 */
function showToast(message, type = 'success', duration = 3500) {
  const icons = {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `cf-toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" onclick="this.closest('.cf-toast').remove()">✕</button>
  `;

  getToastContainer().appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Inline Alerts ────────────────────────────────────────────────────────────

/**
 * Show an inline Bootstrap-style alert.
 * @param {string} containerId
 * @param {string} message
 * @param {'danger'|'success'|'warning'|'info'} type
 */
function showAlert(containerId, message, type = 'danger') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show cf-alert" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function clearAlert(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

// ─── Button State ─────────────────────────────────────────────────────────────

/**
 * Disable a button and show spinner text during async operations.
 * @param {HTMLButtonElement} btn
 * @param {string} loadingText
 */
function setButtonLoading(btn, loadingText = 'Saving…') {
  btn.disabled = true;
  btn._originalHTML = btn.innerHTML;
  btn.innerHTML = `
    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
    ${loadingText}
  `;
}

/**
 * Restore button to original state.
 * @param {HTMLButtonElement} btn
 */
function setButtonReady(btn) {
  btn.disabled = false;
  if (btn._originalHTML) btn.innerHTML = btn._originalHTML;
}

// ─── Item Card Rendering ──────────────────────────────────────────────────────

const CATEGORY_ICONS = {
  'Electronics':            '💻',
  'Accessories':            '👜',
  'Books & Stationery':     '📚',
  'Clothing & Accessories': '🧥',
  'Bottles & Containers':   '🍶',
  'ID & Documents':         '🪪',
  'Keys':                   '🔑',
  'Sports & Recreation':    '⚽',
  'Jewelry':                '💍',
  'Other':                  '📦'
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || '📦';
}

/**
 * Render a single item card HTML.
 * @param {Object} item
 * @returns {string} HTML string
 */
function renderItemCard(item) {
  const icon       = getCategoryIcon(item.category);
  const badgeClass = `badge-${item.status.toLowerCase()}`;
  const imgContent = item.image
    ? `<img src="${item.image}" alt="${escapeHTML(item.itemName)}">`
    : `<span class="img-placeholder">${icon}</span>`;

  return `
    <div class="col-sm-6 col-lg-4 col-xl-3">
      <div class="cf-card" onclick="viewItemDetails(${item.id})" role="button" tabindex="0"
           onkeypress="if(event.key==='Enter')viewItemDetails(${item.id})">
        <div class="card-img-wrap">${imgContent}</div>
        <div class="card-body">
          <div class="item-name">${escapeHTML(item.itemName)}</div>
          <div class="item-desc">${escapeHTML(item.description)}</div>
          <div class="item-meta">📍 ${escapeHTML(item.location)}</div>
          <div class="item-meta">📅 ${formatDate(item.dateReported)}</div>
          <div class="card-footer-row">
            <span class="badge-category">${escapeHTML(item.category)}</span>
            <span class="badge-status ${badgeClass}">${item.status}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render an empty state message.
 * @param {string} message
 * @param {string} sub
 * @returns {string} HTML
 */
function renderEmptyState(message = 'No items found', sub = 'Try adjusting your search or filters.') {
  return `
    <div class="col-12">
      <div class="cf-empty">
        <div class="empty-icon">🔍</div>
        <h3>${message}</h3>
        <p>${sub}</p>
      </div>
    </div>
  `;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escape HTML to prevent XSS.
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format ISO date to readable string.
 * @param {string} dateStr
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Get URL query parameter.
 * @param {string} name
 */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Convert a File object to base64 data URL.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Navigate to item detail page.
 * @param {number} id
 */
function viewItemDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

/**
 * Debounce function to limit rapid calls.
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
