import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createSport,
  deleteSport,
  getAllSports,
  getSingleSport,
  updateSport,
} from '../controllers/sportsController.js';

const router = express.Router();

router
  .route('/')
  .post(protect, admin, asyncHandler(createSport))
  .get(asyncHandler(getAllSports));

router
  .route('/:id')
  .get(protect, admin, asyncHandler(getSingleSport))
  .patch(protect, admin, asyncHandler(updateSport))
  .delete(protect, admin, asyncHandler(deleteSport));

export default router;
