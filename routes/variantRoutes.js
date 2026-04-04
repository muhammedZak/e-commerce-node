import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createVariant,
  deleteVariant,
  getVariants,
  updateVariant,
} from '../controllers/variantController.js';

import { uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

router
  .route('/:productId/variants')
  .post(
    protect,
    admin,
    uploadMultiple('images', 'variants'),
    asyncHandler(createVariant),
  )
  .get(asyncHandler(getVariants));

router
  .route('/:id')
  .patch(protect, admin, asyncHandler(updateVariant))
  .delete(protect, admin, asyncHandler(deleteVariant));

export default router;
