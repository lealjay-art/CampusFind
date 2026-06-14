/**
 * api.js
 * CampusFind – Fetch API Module
 * Demonstrates: fetch(), async/await, Promises, error handling
 *
 * Uses JSONPlaceholder to demonstrate real HTTP requests.
 * In production this could be replaced with an actual API.
 */

const API_BASE = 'https://jsonplaceholder.typicode.com';

// ─── Fetch Wrapper ────────────────────────────────────────────────────────────

/**
 * Generic fetch wrapper with error handling and JSON parsing.
 * Demonstrates: fetch API, async/await, try/catch
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<any>}
 */
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Network error – check your connection.');
    }
    throw err;
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch a post from JSONPlaceholder to demonstrate the Fetch API.
 * Displays actual API response data on the home page.
 * Demonstrates: fetch(), async/await, real HTTP GET request
 * @returns {Promise<Object>}
 */
async function fetchTip() {
  // Real fetch() call to JSONPlaceholder (public REST API)
  const randomId = Math.floor(Math.random() * 10) + 1;
  const post = await apiFetch(`${API_BASE}/posts/${randomId}`);
  // Use actual API response – demonstrates real data from fetch()
  return {
    title: post.title,
    body: `[Fetched via fetch() API from JSONPlaceholder #${post.id}] — Always label your belongings with your name and student number. Contact the campus Lost & Found office in the Admin Building for unclaimed items.`
  };
}

/**
 * Simulate fetching recent activity from an API.
 * @returns {Promise<Array>}
 */
async function fetchRecentActivity() {
  // Fetch from JSONPlaceholder to demonstrate real API call
  const comments = await apiFetch(`${API_BASE}/comments?_limit=3`);
  return comments.map((c, i) => ({
    id: c.id,
    action: i % 3 === 0 ? 'Item Reported' : i % 3 === 1 ? 'Item Found' : 'Item Claimed',
    detail: c.name.slice(0, 45)
  }));
}

/**
 * Simulate sending a notification via POST request.
 * Demonstrates: fetch POST, FormData conversion, async/await
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function postNotification(payload) {
  const result = await apiFetch(`${API_BASE}/posts`, {
    method: 'POST',
    body: JSON.stringify({
      title:  payload.title,
      body:   payload.body,
      userId: 1
    })
  });
  return result;
}

/**
 * Check if the app is online by pinging a public URL.
 * @returns {Promise<boolean>}
 */
async function checkOnlineStatus() {
  try {
    await fetch(`${API_BASE}/posts/1`, { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}
