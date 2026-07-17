import express from 'express';
import {
  getAdminStats,
  getAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllComments,
  deleteCommentByAdmin,
  getAllPagesAdmin,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect & admin middleware to all routes in this file
router.use(protect);
router.use(admin);

router.get('/stats', getAdminStats);
router.get('/analytics', getAnalytics);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

// Comment moderation
router.get('/comments', getAllComments);
router.delete('/comments/:id', deleteCommentByAdmin);

// Page management
router.get('/pages', getAllPagesAdmin);

export default router;

