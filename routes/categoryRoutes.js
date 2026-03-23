import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router
  .route('/')
  .post(protect, admin, asyncHandler(createCategory))
  .get(asyncHandler(getAllCategory));

router
  .route('/:id')
  .get(asyncHandler(getSingleCategory))
  .patch(protect, admin, asyncHandler(updateCategory))
  .delete(protect, admin, asyncHandler(deleteCategory));

export default router;
