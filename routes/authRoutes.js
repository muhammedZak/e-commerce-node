import express from 'express';
import {
  registerUser,
  loginUser,
  userLogOut,
  forgotPassword,
  resetpassword,
  verifyEmail,
} from '../controllers/authController.js';

import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));
router.post('/logout',protect, asyncHandler(userLogOut));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password/:token', asyncHandler(resetpassword));
router.get('/verify-email/:token', asyncHandler(verifyEmail));

export default router;
