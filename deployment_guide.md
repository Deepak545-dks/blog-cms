# BlogCMS: Production Deployment Guide

This guide details steps to deploy the production-ready BlogCMS project using modern cloud hosting solutions.

---

## 1. Database Setup: MongoDB Atlas

1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Free Cluster (M0 Sandbox).
3. Under **Network Access**, add IP address `0.0.0.0/0` (allows API accesses from Vercel/Render).
4. Under **Database Access**, create a user account and save the credentials securely.
5. Retrieve your cluster connection string (e.g. `mongodb+srv://...`).

---

## 2. Backend API Setup: Render.com

1. Sign up on [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the BlogCMS codebase.
4. Set configuration parameters:
   * **Root Directory**: `backend` (or leave root if backend resides in subfolder).
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Click **Advanced** and set Environment Variables:
   * `NODE_ENV`: `production`
   * `MONGO_URI`: `your_mongodb_atlas_uri`
   * `JWT_SECRET`: `your_secure_hash`
   * `CLIENT_URL`: `https://your-frontend-vercel-url.vercel.app`
6. Click **Deploy Web Service** and save your backend API url (e.g., `https://blog-cms-api.onrender.com`).

---

## 3. Frontend Setup: Vercel.com

1. Sign up on [Vercel](https://vercel.com).
2. Select **Add New** -> **Project**.
3. Connect your repository.
4. Set configuration parameters:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Set Environment Variables:
   * `VITE_API_URL`: `https://your-backend-onrender-url.onrender.com/api`
6. Click **Deploy**. Vercel will build and assign a production URL.
