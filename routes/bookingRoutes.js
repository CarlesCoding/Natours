import express from 'express';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { protect } from '../controllers/authController.js';
import { getCheckoutSession } from '../controllers/bookingController.js';

const router = express.Router();

router.get(
    '/checkout-session/:tourID',
    protect,
    catchAsyncErrors(getCheckoutSession)
);

export default router;
