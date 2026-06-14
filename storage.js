/**
 * storage.js
 * CampusFind – localStorage abstraction with async simulation
 * Demonstrates: localStorage, JSON.stringify, JSON.parse, async/await, Promises
 */

const STORAGE_KEY = 'campusfind_items';
const ADMIN_KEY   = 'campusfind_admin';

/** Seed data shown on first load */
const SEED_ITEMS = [
  {
    id: 1,
    itemName: 'Black Leather Wallet',
    category: 'Accessories',
    description: 'Black leather bifold wallet found near the Computer Lab entrance. Contains some cards but no ID.',
    location: 'Computer Lab – Building A',
    dateReported: '2026-06-10',
    status: 'Found',
    image: '',
    reportedBy: 'Maria Santos',
    contact: 'maria@campus.edu'
  },
  {
    id: 2,
    itemName: 'Hydro Flask Water Bottle',
    category: 'Bottles & Containers',
    description: 'Blue 32oz Hydro Flask with campus sticker on the side. Last seen at the library study area.',
    location: 'Main Library – 2nd Floor',
    dateReported: '2026-06-09',
    status: 'Lost',
    image: '',
    reportedBy: 'Juan dela Cruz',
    contact: 'juan@campus.edu'
  },
  {
    id: 3,
    itemName: 'HP Laptop Charger',
    category: 'Electronics',
    description: 'HP 65W USB-C laptop charger found plugged into outlet near the common area. Grey color.',
    location: 'Student Lounge – Main Building',
    dateReported: '2026-06-08',
    status: 'Found',
    image: '',
    reportedBy: 'Ana Reyes',
    contact: 'ana@campus.edu'
  },
  {
    id: 4,
    itemName: 'Blue Umbrella',
    category: 'Clothing & Accessories',
    description: 'Navy blue compact umbrella with a floral handle. Found after heavy rain near the cafeteria.',
    location: 'Cafeteria – East Wing',
    dateReported: '2026-06-07',
    status: 'Claimed',
    image: '',
    reportedBy: 'Carlo Mendoza',
    contact: 'carlo@campus.edu'
  },
  {
    id: 5,
    itemName: 'Physics Textbook',
    category: 'Books & Stationery',
    description: 'University Physics 14th Edition by Young & Freedman. Name "Rina V." written inside front cover.',
    location: 'Science Building – Room 301',
    dateReported: '2026-06-06',
    status: 'Found',
    image: '',
    reportedBy: 'Security Office',
    contact: 'security@campus.edu'
  },
  {
    id: 6,
    itemName: 'Airpods Pro Case',
    category: 'Electronics',
    description: 'White AirPods Pro charging case (no earbuds inside). Found in the gymnasium locker area.',
    location: 'Gymnasium – Locker Room',
    dateReported: '2026-06-05',
    status: 'Lost',
    image: '',
    reportedBy: 'Miguel Torres',
    contact: 'miguel@campus.edu'
  }
];

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Initialize storage with seed data if empty.
 * Uses async/await + Promise to simulate network delay.
 */
async function initStorage() {
  return new Promise((resolve) => {
    // Simulate async initialization (e.g. reading from server)
    setTimeout(() => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // JSON.stringify: convert objects array → JSON string for storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ITEMS));
      }
      resolve(true);
    }, 100);
  });
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

/**
 * Retrieve all items from localStorage.
 * Demonstrates: JSON.parse to convert stored string back to array.
 * @returns {Promise<Array>}
 */
async function getAllItems() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        // JSON.parse: convert JSON string → JavaScript array
        const items = raw ? JSON.parse(raw) : [];
        resolve(items);
      } catch (err) {
        reject(new Error('Failed to load items: ' + err.message));
      }
    }, 300); // Simulated network delay
  });
}

/**
 * Get a single item by ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function getItemById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const items = await getAllItems();
        const item = items.find(i => i.id === Number(id));
        resolve(item || null);
      } catch (err) {
        reject(err);
      }
    }, 200);
  });
}

/**
 * Save a new item to localStorage.
 * Demonstrates: JSON.stringify to persist updated array.
 * @param {Object} itemData
 * @returns {Promise<Object>} The created item with generated ID
 */
async function saveItem(itemData) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const items = await getAllItems();
        // Generate unique ID
        const newId = items.length > 0
          ? Math.max(...items.map(i => i.id)) + 1
          : 1;

        const newItem = {
          id: newId,
          ...itemData,
          dateReported: itemData.dateReported || new Date().toISOString().split('T')[0]
        };

        items.unshift(newItem); // Add to beginning
        // JSON.stringify: serialize to string for localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        resolve(newItem);
      } catch (err) {
        reject(new Error('Failed to save item: ' + err.message));
      }
    }, 400);
  });
}

/**
 * Update an existing item.
 * @param {number} id
 * @param {Object} updates
 * @returns {Promise<Object>} Updated item
 */
async function updateItem(id, updates) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const items = await getAllItems();
        const idx = items.findIndex(i => i.id === Number(id));
        if (idx === -1) {
          reject(new Error('Item not found'));
          return;
        }
        items[idx] = { ...items[idx], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        resolve(items[idx]);
      } catch (err) {
        reject(new Error('Failed to update item: ' + err.message));
      }
    }, 350);
  });
}

/**
 * Delete an item by ID.
 * @param {number} id
 * @returns {Promise<boolean>}
 */
async function deleteItem(id) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const items = await getAllItems();
        const filtered = items.filter(i => i.id !== Number(id));
        if (filtered.length === items.length) {
          reject(new Error('Item not found'));
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        resolve(true);
      } catch (err) {
        reject(new Error('Failed to delete item: ' + err.message));
      }
    }, 300);
  });
}

/**
 * Search items by query string.
 * @param {string} query
 * @param {string} status  - 'all'|'Lost'|'Found'|'Claimed'
 * @param {string} category
 * @returns {Promise<Array>}
 */
async function searchItems(query = '', status = 'all', category = 'all') {
  return new Promise(async (resolve, reject) => {
    try {
      const items = await getAllItems();
      const q = query.toLowerCase().trim();
      const filtered = items.filter(item => {
        const matchQuery = !q ||
          item.itemName.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        const matchStatus   = status === 'all'   || item.status   === status;
        const matchCategory = category === 'all' || item.category === category;
        return matchQuery && matchStatus && matchCategory;
      });
      resolve(filtered);
    } catch (err) {
      reject(err);
    }
  });
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

const ADMIN_CREDENTIALS = { username: 'admin', password: 'campusfind2026' };

/**
 * Authenticate admin user.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>}
 */
async function adminLogin(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (
        username === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        const session = {
          loggedIn: true,
          username,
          loginTime: Date.now()
        };
        localStorage.setItem(ADMIN_KEY, JSON.stringify(session));
        resolve(true);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 600);
  });
}

function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
}

function isAdminLoggedIn() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    // Session expires after 8 hours
    const expired = Date.now() - session.loginTime > 8 * 60 * 60 * 1000;
    if (expired) { adminLogout(); return false; }
    return session.loggedIn === true;
  } catch { return false; }
}

/**
 * Get item statistics.
 * @returns {Promise<Object>}
 */
async function getStats() {
  const items = await getAllItems();
  return {
    total:   items.length,
    lost:    items.filter(i => i.status === 'Lost').length,
    found:   items.filter(i => i.status === 'Found').length,
    claimed: items.filter(i => i.status === 'Claimed').length
  };
}

/**
 * Get unique categories.
 * @returns {Promise<string[]>}
 */
async function getCategories() {
  const items = await getAllItems();
  return [...new Set(items.map(i => i.category))].sort();
}
