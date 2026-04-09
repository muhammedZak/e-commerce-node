import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { admin, protect } from '../middleware/authMiddleware.js';
import {
  createProducts,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/productController.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

router
  .route('/')
  .post(
    protect,
    admin,
    uploadSingle('picture', 'products'),
    asyncHandler(createProducts),
  )
  .get(asyncHandler(getProducts));

router
  .route('/:id')
  .get(asyncHandler(getProduct))
  .patch(
    protect,
    admin,
    uploadSingle('picture', 'products'),
    asyncHandler(updateProduct),
  )
  .delete(protect, admin, asyncHandler(deleteProduct));

export default router;
