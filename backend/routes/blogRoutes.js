import express from 'express';
import {
  createBlog,
  getBlogs,
  getMyBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  getDashboardStats,
} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/slug/:slug', getBlogBySlug);

// Private routes (requires authentication)
router.post('/', protect, upload.single('featuredImage'), createBlog);
router.get('/my-blogs', protect, getMyBlogs);
router.get('/stats', protect, getDashboardStats);
router.get('/:id', protect, getBlogById);
router.put('/:id', protect, upload.single('featuredImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);

export default router;

