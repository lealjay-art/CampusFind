# 🎓 CampusFind – Campus Lost & Found Board

**IT Final Project – Track B: Static Tool Deployment**
Deployed on Netlify (Free Hosting) | No Backend | No Database

---

## 📋 Project Overview

CampusFind is a responsive web-based Lost & Found board for campus use. Students can browse, search, and report lost or found items. Administrators manage all records through a secure dashboard.

---

## 🔑 Admin Login Credentials

| Field    | Value             |
|----------|-------------------|
| Username | `admin`           |
| Password | `campusfind2026`  |

---

## 📁 Folder Structure

```
campusfind/
├── index.html          ← Public home page (item board + search)
├── submit.html         ← Public item submission form
├── details.html        ← Item detail view
├── login.html          ← Admin login page
├── dashboard.html      ← Admin dashboard (CRUD)
│
├── assets/
│   ├── css/
│   │   └── style.css   ← All styles (CSS variables, responsive)
│   │
│   ├── js/
│   │   ├── storage.js  ← localStorage CRUD (JSON.stringify/parse)
│   │   ├── ui.js       ← Loading spinner, toasts, card rendering
│   │   ├── api.js      ← fetch() API demonstration
│   │   ├── auth.js     ← Admin session management
│   │   ├── app.js      ← Public page logic
│   │   └── dashboard.js← Admin CRUD + modal logic
│   │
│   └── images/         ← (Place any static images here)
│
└── README.md           ← This file
```

---

## ✅ Technical Requirements Checklist

### A. No Database / localStorage API
- [x] All item data stored in `localStorage`
- [x] `JSON.stringify()` used when saving items
- [x] `JSON.parse()` used when reading items
- [x] Admin session stored in localStorage

### B. Asynchronous Programming
- [x] `async/await` used throughout storage.js, app.js, dashboard.js
- [x] `Promise` wrappers simulate async CRUD operations
- [x] `setTimeout()` used to simulate network delay
- [x] `showLoading()` / `hideLoading()` during async actions

### C. Fetch API
- [x] `fetch()` used in api.js to call JSONPlaceholder
- [x] Error handling with try/catch on all fetch calls
- [x] POST request demonstrated on item submission

### D. FormData API
- [x] `new FormData(form)` used in submit form (app.js)
- [x] `new FormData(form)` used in admin item form (dashboard.js)
- [x] `new FormData(form)` used in login form (auth.js)
- [x] `e.preventDefault()` on all form submissions

### E. Bootstrap 5 Responsive Design
- [x] Bootstrap 5.3 via CDN
- [x] Navbar with mobile collapse
- [x] Grid: container → row → col-sm-6 col-lg-4 col-xl-3
- [x] Cards, Tables, Modals, Forms, Alerts, Badges
- [x] Responsive on Desktop, Tablet, and Mobile

---

## 📸 Screenshot Guide (15 Required)

| # | Screenshot | Where to Take It |
|---|-----------|-----------------|
| 1 | Home page – hero section | index.html (top) |
| 2 | Item cards grid (desktop) | index.html (scroll down) |
| 3 | Item cards grid (mobile) | index.html (mobile view) |
| 4 | Search in action | Type in search bar |
| 5 | Status filter active | Click "Lost" filter |
| 6 | Submit item form | submit.html |
| 7 | Item detail page | Click any item card |
| 8 | Admin login page | login.html |
| 9 | Admin dashboard – stat cards | dashboard.html |
| 10 | Admin items table | dashboard.html (scroll) |
| 11 | Add/Edit modal | Click "+ Add" button |
| 12 | Delete confirmation modal | Click 🗑️ on any item |
| 13 | localStorage in DevTools | F12 → Application → localStorage |
| 14 | Loading spinner | Refresh page (brief) |
| 15 | Toast notification | Submit an item |

**DevTools proof of localStorage:**
1. Open Chrome → F12 → Application tab
2. Expand `localStorage` → click `http://localhost`
3. Click `campusfind_items` to see JSON data

---

## 🚀 Deployment Instructions

### Local Testing
Simply open `index.html` in any modern browser. No server needed.

### GitHub Upload
```bash
git init
git add .
git commit -m "CampusFind IT Final Project"
git remote add origin https://github.com/YOUR_USERNAME/campusfind.git
git push -u origin main
```

### Netlify Deployment (Drag & Drop)
1. Go to [netlify.com](https://netlify.com) → Log in
2. Click **"Add new site"** → **"Deploy manually"**
3. Drag the **entire `campusfind/` folder** into the upload area
4. Wait ~30 seconds → your site is live!
5. Copy your Netlify URL (e.g. `https://campusfind-xxxx.netlify.app`)

### Netlify via GitHub (Auto-Deploy)
1. Push code to GitHub
2. Netlify → **"Add new site"** → **"Import from Git"**
3. Connect GitHub → select your repo
4. Build command: *(leave empty)*
5. Publish directory: `.` (root)
6. Click **Deploy**

---

## 🎨 Design Theme

- **Palette:** Indigo (#1e3a8a) / Blue (#3b5bdb) / Amber accent (#f59e0b)
- **Fonts:** Plus Jakarta Sans (headings) + Inter (body)
- **Layout:** Mobile-first Bootstrap grid
- **Cards:** Hover lift with blue border highlight

---

## 📚 Technologies Used

| Technology | Purpose |
|-----------|---------|
| HTML5 | Page structure |
| CSS3 + CSS Variables | Styling & theming |
| Bootstrap 5 | Responsive grid & components |
| Vanilla JavaScript (ES2021) | Logic, async, DOM |
| localStorage API | Data persistence |
| Fetch API | External HTTP requests |
| FormData API | Form handling |
| Google Fonts | Typography |
| Netlify | Static hosting |

---

*Built for IT Final Project – Track B: Static Tool Deployment*
*© 2026 CampusFind*
