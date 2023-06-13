import express from 'express';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { protect, restrictRolesTo } from '../controllers/authController.js';
import {
    getAllReviews,
    createReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router
    .route('/')
    .get(catchAsyncErrors(getAllReviews))
    .post(
        catchAsyncErrors(protect),
        restrictRolesTo('user'),
        catchAsyncErrors(createReview)
    );

export default router;
