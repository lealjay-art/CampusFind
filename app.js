/**
 * app.js
 * CampusFind – Public Page Controller
 * Demonstrates: async/await, fetch, FormData, localStorage, Promises
 */

// ─── State ────────────────────────────────────────────────────────────────────

let currentFilter  = { status: 'all', category: 'all', query: '' };
let allCategories  = [];

// ─── Home Page ────────────────────────────────────────────────────────────────

/**
 * Initialize the home (index) page.
 * Demonstrates: async/await, Promise chain, fetch API
 */
async function initHomePage() {
  showLoading('Loading lost & found items…');

  try {
    // Initialize localStorage with seed data
    await initStorage();

    // Fetch items from localStorage (async)
    await fetchItems();

    // Fetch categories for filter bar
    allCategories = await getCategories();
    renderCategoryFilters();

    // Update hero statistics
    await updateHeroStats();

    // Demonstrate fetch() API – load a campus tip from external API
    loadCampusTip();

    hideLoading();
  } catch (err) {
    hideLoading();
    showAlert('itemsAlert', `Failed to load items: ${err.message}`, 'danger');
    console.error('Home page init error:', err);
  }
}

/**
 * Fetch items from localStorage and render to DOM.
 * Core async/await + localStorage demonstration.
 */
async function fetchItems() {
  const grid = document.getElementById('itemsGrid');
  if (!grid) return;

  // Simulate loading
  grid.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="cf-spinner mx-auto"></div>
    </div>
  `;

  await new Promise(resolve => setTimeout(resolve, 600)); // Simulated delay

  try {
    const items = await searchItems(
      currentFilter.query,
      currentFilter.status,
      currentFilter.category
    );

    if (items.length === 0) {
      grid.innerHTML = renderEmptyState(
        'No items match your search',
        'Try different keywords or clear the filters.'
      );
    } else {
      grid.innerHTML = items.map(renderItemCard).join('');
      // Update count
      const countEl = document.getElementById('itemCount');
      if (countEl) countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} found`;
    }
  } catch (err) {
    grid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Failed to load items. ${err.message}
        </div>
      </div>
    `;
  }
}

/**
 * Update hero section statistics.
 */
async function updateHeroStats() {
  try {
    const stats = await getStats();
    const el = id => document.getElementById(id);
    if (el('statTotal'))   el('statTotal').textContent   = stats.total;
    if (el('statLost'))    el('statLost').textContent    = stats.lost;
    if (el('statFound'))   el('statFound').textContent   = stats.found;
    if (el('statClaimed')) el('statClaimed').textContent = stats.claimed;
  } catch (err) {
    console.warn('Stats update failed:', err);
  }
}

/**
 * Load campus tip using fetch() API (external request demonstration).
 */
async function loadCampusTip() {
  try {
    const tip = await fetchTip();
    const tipEl    = document.getElementById('campusTip');
    const bannerEl = document.getElementById('tipBanner');
    if (tipEl && bannerEl) {
      tipEl.textContent = tip.body;
      bannerEl.classList.remove('d-none');
    }
  } catch {
    // Silently fail – tip is non-critical
  }
}

/**
 * Render category filter buttons dynamically.
 */
function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  const html = allCategories.map(cat => `
    <button class="filter-btn" data-category="${escapeHTML(cat)}"
            onclick="filterByCategory(this, '${escapeHTML(cat)}')">
      ${getCategoryIcon(cat)} ${escapeHTML(cat)}
    </button>
  `).join('');

  container.innerHTML = html;
}

// ─── Filter Handlers ──────────────────────────────────────────────────────────

function filterByStatus(btn, status) {
  document.querySelectorAll('.filter-status').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter.status = status;
  fetchItems();
}

function filterByCategory(btn, category) {
  document.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
  if (currentFilter.category === category) {
    currentFilter.category = 'all';
  } else {
    btn.classList.add('active');
    currentFilter.category = category;
  }
  fetchItems();
}

/** Handle search input with debounce. */
const handleSearch = debounce(function (query) {
  currentFilter.query = query;
  fetchItems();
}, 350);

function onSearchInput(input) {
  handleSearch(input.value);
}

function onSearchSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('heroSearch') || document.getElementById('mainSearch');
  if (input) {
    currentFilter.query = input.value;
    fetchItems();
  }
}

function clearSearch() {
  currentFilter = { status: 'all', category: 'all', query: '' };
  const searchInputs = document.querySelectorAll('input[type="search"], input[type="text"][id*="Search"]');
  searchInputs.forEach(i => i.value = '');
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.filter-btn[data-status="all"]');
  if (allBtn) allBtn.classList.add('active');
  fetchItems();
}

// ─── Submit Page ──────────────────────────────────────────────────────────────

/**
 * Initialize the Submit Item page.
 */
async function initSubmitPage() {
  await initStorage();
  const form = document.getElementById('submitForm');
  if (form) {
    form.addEventListener('submit', handleSubmitItem);
  }

  // Image preview handler
  const imageInput = document.getElementById('imageInput');
  if (imageInput) {
    imageInput.addEventListener('change', handleImagePreview);
  }
}

/**
 * Handle item submission form.
 * Demonstrates: FormData API, async/await, file reading
 * @param {Event} e
 */
async function handleSubmitItem(e) {
  e.preventDefault(); // FormData: prevent default submission

  const form   = e.target;
  const btn    = form.querySelector('[type="submit"]');

  clearAlert('submitAlert');

  // ── FormData API ─────────────────────────────────────
  const formData = new FormData(form);
  const itemName    = formData.get('itemName')?.trim();
  const category    = formData.get('category');
  const description = formData.get('description')?.trim();
  const location    = formData.get('location')?.trim();
  const status      = formData.get('status');
  const reportedBy  = formData.get('reportedBy')?.trim();
  const contact     = formData.get('contact')?.trim();
  const dateReported = formData.get('dateReported');

  // Validation
  if (!itemName || !category || !description || !location || !status) {
    showAlert('submitAlert', '⚠️ Please fill in all required fields.', 'warning');
    return;
  }

  setButtonLoading(btn, 'Submitting…');
  showLoading('Saving your report…');

  try {
    // Handle image upload (convert to base64)
    let imageData = '';
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      imageData = await fileToBase64(imageFile);
    }

    // Build item object
    const newItem = {
      itemName, category, description, location,
      status, reportedBy: reportedBy || 'Anonymous',
      contact: contact || '',
      dateReported: dateReported || new Date().toISOString().split('T')[0],
      image: imageData
    };

    // Simulate POST to API (fetch demonstration)
    await postNotification({ title: `New item: ${itemName}`, body: description });

    // Save to localStorage (async)
    await saveItem(newItem);

    hideLoading();
    setButtonReady(btn);
    showToast('Item reported successfully! ✅', 'success');

    form.reset();
    document.getElementById('imagePreview').style.display = 'none';

    // Redirect after delay
    await new Promise(r => setTimeout(r, 1500));
    window.location.href = 'index.html';
  } catch (err) {
    hideLoading();
    setButtonReady(btn);
    showAlert('submitAlert', `❌ Submission failed: ${err.message}`, 'danger');
  }
}

/**
 * Show image preview when file is selected.
 */
async function handleImagePreview(e) {
  const file    = e.target.files[0];
  const preview = document.getElementById('imagePreview');
  if (!file || !preview) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file.', 'warning');
    e.target.value = '';
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB.', 'warning');
    e.target.value = '';
    return;
  }

  try {
    const dataUrl = await fileToBase64(file);
    preview.src   = dataUrl;
    preview.style.display = 'block';
  } catch (err) {
    showToast('Could not preview image.', 'error');
  }
}

// ─── Detail Page ──────────────────────────────────────────────────────────────

/**
 * Initialize item details page.
 */
async function initDetailsPage() {
  showLoading('Loading item details…');
  await initStorage();

  const id = getQueryParam('id');
  if (!id) {
    hideLoading();
    document.getElementById('detailContent').innerHTML = `
      <div class="alert alert-warning">No item ID specified. <a href="index.html">Go back</a>.</div>
    `;
    return;
  }

  try {
    const item = await getItemById(id);
    hideLoading();

    if (!item) {
      document.getElementById('detailContent').innerHTML = `
        <div class="alert alert-danger">Item not found. <a href="index.html">Browse all items</a>.</div>
      `;
      return;
    }

    renderItemDetails(item);
  } catch (err) {
    hideLoading();
    document.getElementById('detailContent').innerHTML = `
      <div class="alert alert-danger">Error loading item: ${err.message}</div>
    `;
  }
}

/**
 * Render item detail view.
 */
function renderItemDetails(item) {
  const icon       = getCategoryIcon(item.category);
  const badgeClass = `badge-${item.status.toLowerCase()}`;

  const imgHTML = item.image
    ? `<img src="${item.image}" alt="${escapeHTML(item.itemName)}">`
    : `<div class="detail-img-placeholder">${icon}</div>`;

  document.getElementById('detailContent').innerHTML = `
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="detail-img-wrap">${imgHTML}</div>
      </div>
      <div class="col-lg-5">
        <div class="detail-info-card">
          <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
            <h1>${escapeHTML(item.itemName)}</h1>
            <span class="badge-status ${badgeClass}" style="flex-shrink:0;margin-top:.35rem;">${item.status}</span>
          </div>
          <p class="detail-desc">${escapeHTML(item.description)}</p>

          <div class="detail-rows">
            <div class="detail-row">
              <span class="detail-label">Category</span>
              <span class="detail-value"><span class="badge-category">${escapeHTML(item.category)}</span></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location</span>
              <span class="detail-value">📍 ${escapeHTML(item.location)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${formatDate(item.dateReported)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Reported By</span>
              <span class="detail-value">${escapeHTML(item.reportedBy || 'Anonymous')}</span>
            </div>
            ${item.contact ? `
            <div class="detail-row">
              <span class="detail-label">Contact</span>
              <span class="detail-value">${escapeHTML(item.contact)}</span>
            </div>` : ''}
            <div class="detail-row">
              <span class="detail-label">Item ID</span>
              <span class="detail-value mono">#${item.id}</span>
            </div>
          </div>

          <div class="detail-actions">
            <a href="index.html" class="btn-cf-outline">← Back to Board</a>
            ${item.status !== 'Claimed' ? `
              <button class="btn-cf-primary" onclick="claimItem(${item.id})">
                Mark as Claimed
              </button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;

  document.title = `${item.itemName} – CampusFind`;
}

/**
 * Claim an item from the details page.
 */
async function claimItem(id) {
  if (!confirm('Mark this item as claimed?')) return;
  showLoading('Updating status…');
  try {
    await updateItem(id, { status: 'Claimed' });
    hideLoading();
    showToast('Item marked as claimed ✅', 'success');
    await new Promise(r => setTimeout(r, 800));
    window.location.reload();
  } catch (err) {
    hideLoading();
    showToast(`Failed: ${err.message}`, 'error');
  }
}
