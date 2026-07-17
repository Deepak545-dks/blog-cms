import express from 'express';
import {
  addComment,
  getBlogComments,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to view blog comments
router.get('/blog/:blogId', getBlogComments);

// Private routes to add or delete comments
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
