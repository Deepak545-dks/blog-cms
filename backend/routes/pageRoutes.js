import express from 'express';
import {
  createPage,
  getPages,
  getPageById,
  getPageBySlug,
  updatePage,
  deletePage,
} from '../controllers/pageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/slug/:slug', getPageBySlug);

// Private routes (requires authentication)
router.post('/', protect, createPage);
router.get('/', protect, getPages);
router.get('/:id', protect, getPageById);
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, deletePage);

export default router;
