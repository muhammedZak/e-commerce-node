import express from 'express';
import { getUserProfile } from '../controllers/userController.js';

import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, asyncHandler(getUserProfile));

export default router;
