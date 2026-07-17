import express from 'express';
import {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Register route with optional profile image upload
router.post('/register', upload.single('profileImage'), registerUser);

// Login route
router.post('/login', authUser);

// Profile route - protected
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profileImage'), updateUserProfile);

// Password change - protected
router.put('/password', protect, changeUserPassword);

export default router;

