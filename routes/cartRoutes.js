import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCart,
} from '../controllers/cartController.js';

const router = express.Router();

router.post('/add', protect, asyncHandler(addToCart));

router.get('/', protect, asyncHandler(getCart));

router.put('/update/:itemId', protect, asyncHandler(updateCart));

router.delete('/remove/:itemId', protect, asyncHandler(removeCartItem));

router.delete('/clear', protect, asyncHandler(clearCart));

export default router;
