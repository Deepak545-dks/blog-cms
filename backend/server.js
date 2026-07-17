import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import Blog from './models/blogModel.js';
import Page from './models/pageModel.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security Headers
app.use(helmet({ contentSecurityPolicy: false }));

// Rate Limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input XSS Script Sanitization
app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '');
      }
    }
  }
  next();
});


// Serve static upload files
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Dynamic Robots & Sitemap
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /dashboard/\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res, next) => {
  try {
    res.type('application/xml');
    let blogs = [];
    let pages = [];

    if (global.useMockDb) {
      const blogsFile = path.resolve('data', 'blogs.json');
      const pagesFile = path.resolve('data', 'pages.json');
      blogs = fs.existsSync(blogsFile) ? JSON.parse(fs.readFileSync(blogsFile, 'utf-8')) : [];
      pages = fs.existsSync(pagesFile) ? JSON.parse(fs.readFileSync(pagesFile, 'utf-8')) : [];
    } else {
      blogs = await Blog.find({ status: 'Published' }).select('slug updatedAt status');
      pages = await Page.find({}).select('slug updatedAt');
    }

    const publishedBlogs = blogs.filter(b => b.status === 'Published');
    const host = `${req.protocol}://${req.get('host')}`;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <url>\n    <loc>${host}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${host}/blogs</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

    publishedBlogs.forEach(b => {
      xml += `  <url>\n    <loc>${host}/blog/${b.slug}</loc>\n    <lastmod>${new Date(b.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    pages.forEach(p => {
      xml += `  <url>\n    <loc>${host}/page/${p.slug}</loc>\n    <lastmod>${new Date(p.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    xml += '</urlset>';
    res.send(xml);
  } catch (error) {
    next(error);
  }
});



// Base route/Health check
app.get('/', (req, res) => {
  res.json({ message: 'Blog CMS API is running...' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
