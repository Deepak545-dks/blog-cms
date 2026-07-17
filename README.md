# BlogCMS: Professional Content Management System

A production-ready, feature-rich Blog Content Management System designed for student internships and portfolio showcases. Built with React, Node.js, Express, and MongoDB.

---

## 🎨 System Highlights

1. **Rich Dashboard & Analytics**: Custom React-SVG charts rendering monthly metrics, traffic views, and comments. Includes recent system activity logs.
2. **Page Builder Editor**: WordPress/Elementor-like drag-and-drop designer workspace. Draggable layouts (Headings, Paragraphs, Images, Buttons, Dividers, Videos, Spacers, Quotes). Complete with multi-state undo/redo history and auto-save background updates.
3. **SEO Optimized**: Dynamic header title adjustments, canonical links, description meta tags, Open Graph (Facebook), Twitter Cards, and automatically generated `robots.txt` / `sitemap.xml`.
4. **Dark & Light Themes**: Responsive theme modes with persistent local storage.
5. **Secure Middleware**: Helmet security headers, rate-limiting rules protecting endpoints, XSS injection sanitizations, and JWT authorization checks.

---

## 📂 Project Structure

```bash
BlogCMS/
├── backend/                  # Node.js + Express API
│   ├── config/               # Database connection
│   ├── controllers/          # Request handlers (auth, blogs, pages, admin)
│   ├── data/                 # Mock JSON DB fallbacks
│   ├── middleware/           # auth, uploads, error handling
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # REST Route mappings
│   ├── uploads/              # Local uploaded image directories
│   ├── .env.example
│   └── server.js             # Express entry file
│
└── frontend/                 # React.js + Vite App
    ├── src/
    │   ├── components/       # ProtectedRoute, AuthLayout
    │   ├── context/          # AuthContext, SettingsContext
    │   ├── hooks/            # useSEO custom tag injector
    │   ├── layouts/          # DashboardLayout sidebar navigation
    │   ├── pages/            # View pages (Builder, Canvas, Admin Panel, Analytics)
    │   ├── services/         # Axios api connection service
    │   ├── App.jsx           # Lazy-split routing tree
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

---

## 🛠️ Local Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Optional, falls back to Mock JSON files automatically if unavailable)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Configure values
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` inside your browser.

---

## 🔒 Default Admin Credentials
For testing admin privileges on a fresh local JSON install:
- **Email**: `admin@test.com`
- **Password**: `password123`
