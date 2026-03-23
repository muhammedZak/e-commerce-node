import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  updateSubCategory,
  getSubCategoriesByCategory,
} from '../controllers/subCategoryController.js';

const router = express.Router();

router
  .route('/')
  .post(protect, admin, asyncHandler(createSubCategory))
  .get(asyncHandler(getAllSubCategory));

router.get(
  '/:categoryId/subCategories',
  asyncHandler(getSubCategoriesByCategory),
);

router
  .route('/:id')
  .get(asyncHandler(getSingleSubCategory))
  .patch(protect, admin, asyncHandler(updateSubCategory))
  .delete(protect, admin, asyncHandler(deleteSubCategory));

export default router;
