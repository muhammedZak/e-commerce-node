import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { admin, protect } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);

router.post('/', protect, asyncHandler(createOrder));

router.get('/my', protect, asyncHandler(getMyOrders));

router.get('/:id', protect, asyncHandler(getOrderById));

router.put('/:id/pay', asyncHandler());

router.put('/:id/status', admin, asyncHandler(updateOrderStatus));

export default router;
