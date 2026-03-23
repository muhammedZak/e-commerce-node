import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import { getCatalog } from '../controllers/catalogController.js';

const router = express.Router();

router.get('/', asyncHandler(getCatalog));

export default router;
