/**
 * dashboard.js
 * CampusFind – Admin Dashboard Controller
 * Demonstrates: async/await, CRUD via localStorage, FormData, modals
 */

let editingItemId = null;
let dashFilter    = { query: '', status: 'all', category: 'all' };

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Initialize the admin dashboard.
 */
async function initDashboard() {
  requireAdminAuth(); // Redirect if not logged in

  showLoading('Loading dashboard…');
  await initStorage();

  try {
    await refreshDashboard();
    hideLoading();
    showToast('Dashboard loaded ✅', 'success');

    // Wire up search with debounce
    const searchInput = document.getElementById('dashSearch');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(e => {
        dashFilter.query = e.target.value;
        renderItemsTable();
      }, 300));
    }

    // Wire up form
    const itemForm = document.getElementById('itemForm');
    if (itemForm) itemForm.addEventListener('submit', handleSaveItem);

    // Image preview
    const imgInput = document.getElementById('adminImageInput');
    if (imgInput) imgInput.addEventListener('change', handleAdminImagePreview);

  } catch (err) {
    hideLoading();
    showAlert('dashAlert', `Failed to load dashboard: ${err.message}`, 'danger');
  }
}

/**
 * Refresh all dashboard data.
 */
async function refreshDashboard() {
  await Promise.all([
    updateStatCards(),
    renderItemsTable()
  ]);
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Update stat cards with current counts.
 */
async function updateStatCards() {
  try {
    const stats = await getStats();
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    set('dashTotal',   stats.total);
    set('dashLost',    stats.lost);
    set('dashFound',   stats.found);
    set('dashClaimed', stats.claimed);
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// ─── Table Rendering ──────────────────────────────────────────────────────────

/**
 * Fetch and render items table.
 */
async function renderItemsTable() {
  const tbody = document.getElementById('itemsTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-4">
        <div class="cf-spinner mx-auto"></div>
      </td>
    </tr>
  `;

  await new Promise(r => setTimeout(r, 300));

  try {
    const items = await searchItems(
      dashFilter.query,
      dashFilter.status,
      dashFilter.category
    );

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4" style="color:var(--text-muted)">
            <div style="font-size:2rem;margin-bottom:.5rem">📭</div>
            No items found
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const statusColors = {
        Lost:    { bg: 'rgba(255,94,122,.15)',  color: '#ff5e7a', border: 'rgba(255,94,122,.4)' },
        Found:   { bg: 'rgba(0,212,138,.15)',   color: '#00d48a', border: 'rgba(0,212,138,.4)' },
        Claimed: { bg: 'rgba(251,191,36,.15)',  color: '#fbbf24', border: 'rgba(251,191,36,.4)' }
      };
      const sc = statusColors[item.status] || statusColors.Lost;
      return `
        <tr>
          <td>
            <span style="font-weight:700;font-family:monospace;font-size:.78rem;
                         color:#7ea3d0;background:rgba(79,142,255,.08);
                         padding:.2rem .5rem;border-radius:4px;border:1px solid rgba(79,142,255,.15);">
              #${item.id}
            </span>
          </td>
          <td>
            <div style="font-weight:700;font-size:.92rem;color:#f0f6ff;margin-bottom:.25rem;
                        max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${escapeHTML(item.itemName)}
            </div>
            <div style="font-size:.78rem;color:#8ba4c8;line-height:1.4;
                        max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${escapeHTML(item.description.slice(0, 60))}${item.description.length > 60 ? '…' : ''}
            </div>
          </td>
          <td>
            <span class="badge-category">${escapeHTML(item.category)}</span>
          </td>
          <td>
            <div style="font-size:.84rem;color:#c8d8f0;font-weight:500;
                        display:flex;align-items:center;gap:.35rem;">
              <span style="color:#4f8eff;font-size:.9rem;">📍</span>
              ${escapeHTML(item.location)}
            </div>
          </td>
          <td>
            <select
              class="status-select"
              style="background:${sc.bg};border-color:${sc.border} !important;
                     color:${sc.color};font-weight:700;"
              onchange="quickStatusChange(${item.id}, this.value)"
              title="Change status"
            >
              <option value="Lost"    ${item.status === 'Lost'    ? 'selected' : ''} style="background:#1a2438;color:#ff5e7a;">● Lost</option>
              <option value="Found"   ${item.status === 'Found'   ? 'selected' : ''} style="background:#1a2438;color:#00d48a;">● Found</option>
              <option value="Claimed" ${item.status === 'Claimed' ? 'selected' : ''} style="background:#1a2438;color:#fbbf24;">● Claimed</option>
            </select>
          </td>
          <td>
            <div style="font-size:.82rem;color:#c8d8f0;font-weight:500;">${formatDate(item.dateReported)}</div>
          </td>
          <td>
            <div class="d-flex gap-2 align-items-center">
              <button class="tbl-btn tbl-btn-edit" title="Edit item" onclick="openEditModal(${item.id})">
                ✏️
              </button>
              <button class="tbl-btn tbl-btn-view" title="View public page" onclick="window.open('details.html?id=${item.id}','_blank')">
                👁
              </button>
              <button class="tbl-btn tbl-btn-delete" title="Delete item" onclick="confirmDeleteItem(${item.id})">
                🗑
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `
      <tr><td colspan="7" class="text-center text-danger">Error: ${err.message}</td></tr>
    `;
  }
}

// ─── Filter Handlers ──────────────────────────────────────────────────────────

function dashFilterStatus(btn, status) {
  document.querySelectorAll('.dash-status-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  dashFilter.status = status;
  renderItemsTable();
}

function dashFilterCategory(category) {
  dashFilter.category = category;
  renderItemsTable();
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

/**
 * Open modal to add a new item.
 */
function openAddModal() {
  editingItemId = null;
  const form = document.getElementById('itemForm');
  if (form) form.reset();
  const preview = document.getElementById('adminImagePreview');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  clearAlert('modalAlert');

  document.getElementById('modalTitle').textContent = 'Add New Item';
  document.getElementById('itemId').value = '';

  const modal = new bootstrap.Modal(document.getElementById('itemModal'));
  modal.show();
}

/**
 * Open modal to edit an existing item.
 * @param {number} id
 */
async function openEditModal(id) {
  editingItemId = id;
  clearAlert('modalAlert');

  showLoading('Loading item…');
  try {
    const item = await getItemById(id);
    hideLoading();
    if (!item) { showToast('Item not found', 'error'); return; }

    // Populate form fields
    document.getElementById('itemId').value          = item.id;
    document.getElementById('fItemName').value       = item.itemName;
    document.getElementById('fCategory').value       = item.category;
    document.getElementById('fDescription').value    = item.description;
    document.getElementById('fLocation').value       = item.location;
    document.getElementById('fDateReported').value   = item.dateReported;
    document.getElementById('fStatus').value         = item.status;
    document.getElementById('fReportedBy').value     = item.reportedBy || '';
    document.getElementById('fContact').value        = item.contact || '';

    const preview = document.getElementById('adminImagePreview');
    if (preview && item.image) {
      preview.src = item.image;
      preview.style.display = 'block';
    } else if (preview) {
      preview.style.display = 'none';
    }

    document.getElementById('modalTitle').textContent = 'Edit Item';
    const modal = new bootstrap.Modal(document.getElementById('itemModal'));
    modal.show();
  } catch (err) {
    hideLoading();
    showToast(`Error: ${err.message}`, 'error');
  }
}

/**
 * Handle save (add or update) item form submission.
 * Demonstrates: FormData API, async/await
 * @param {Event} e
 */
async function handleSaveItem(e) {
  e.preventDefault(); // FormData: prevent default

  const form = e.target;
  const btn  = document.getElementById('saveItemBtn');
  clearAlert('modalAlert');

  // ── FormData API ─────────────────────────────────────
  const formData    = new FormData(form);
  const itemName    = formData.get('itemName')?.trim();
  const category    = formData.get('category');
  const description = formData.get('description')?.trim();
  const location    = formData.get('location')?.trim();
  const status      = formData.get('status');

  // Validation
  if (!itemName || !category || !description || !location || !status) {
    showAlert('modalAlert', '⚠️ Please fill in all required fields.', 'warning');
    return;
  }

  setButtonLoading(btn, 'Saving…');

  try {
    // Handle image
    let imageData = editingItemId
      ? (await getItemById(editingItemId))?.image || ''
      : '';

    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
      imageData = await fileToBase64(imageFile);
    }

    const itemData = {
      itemName, category, description, location, status,
      dateReported: formData.get('dateReported') || new Date().toISOString().split('T')[0],
      reportedBy:   formData.get('reportedBy')?.trim() || 'Admin',
      contact:      formData.get('contact')?.trim() || '',
      image:        imageData
    };

    if (editingItemId) {
      await updateItem(editingItemId, itemData);
      showToast(`"${itemName}" updated ✅`, 'success');
    } else {
      await saveItem(itemData);
      showToast(`"${itemName}" added ✅`, 'success');
    }

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('itemModal'))?.hide();
    await refreshDashboard();
  } catch (err) {
    showAlert('modalAlert', `❌ ${err.message}`, 'danger');
  } finally {
    setButtonReady(btn);
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

let pendingDeleteId = null;

/**
 * Show delete confirmation modal.
 * @param {number} id
 */
async function confirmDeleteItem(id) {
  pendingDeleteId = id;
  try {
    const item = await getItemById(id);
    const nameEl = document.getElementById('deleteItemName');
    if (nameEl && item) nameEl.textContent = `"${item.itemName}"`;
  } catch {}
  const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
  modal.show();
}

/**
 * Execute confirmed delete.
 */
async function executeDelete() {
  if (!pendingDeleteId) return;

  const btn = document.getElementById('confirmDeleteBtn');
  setButtonLoading(btn, 'Deleting…');

  try {
    await deleteItem(pendingDeleteId);
    bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
    showToast('Item deleted successfully.', 'success');
    pendingDeleteId = null;
    await refreshDashboard();
  } catch (err) {
    showToast(`Delete failed: ${err.message}`, 'error');
  } finally {
    setButtonReady(btn);
  }
}

// ─── Image Preview (Admin) ────────────────────────────────────────────────────

async function handleAdminImagePreview(e) {
  const file    = e.target.files[0];
  const preview = document.getElementById('adminImagePreview');
  if (!file || !preview) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB.', 'warning');
    e.target.value = '';
    return;
  }

  try {
    const dataUrl = await fileToBase64(file);
    preview.src   = dataUrl;
    preview.style.display = 'block';
  } catch {
    showToast('Could not preview image.', 'error');
  }
}

// ─── Quick Status Change ──────────────────────────────────────────────────────

async function quickStatusChange(id, newStatus) {
  try {
    await updateItem(id, { status: newStatus });
    showToast(`Status updated to "${newStatus}" ✅`, 'success');
    await refreshDashboard();
  } catch (err) {
    showToast(`Update failed: ${err.message}`, 'error');
  }
}

// ─── Sidebar Toggle (mobile) ──────────────────────────────────────────────────

function toggleSidebar() {
  const sidebar  = document.getElementById('adminSidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const isOpen   = sidebar?.classList.contains('open');

  sidebar?.classList.toggle('open');
  overlay?.classList.toggle('show');

  document.body.style.overflow = isOpen ? '' : 'hidden';
}
