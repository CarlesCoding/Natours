import express from 'express';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { protect, restrictRolesTo } from '../controllers/authController.js';
import {
    getCheckoutSession,
    createBooking,
    deleteBooking,
    updateBooking,
    getBooking,
    getAllBooking,
} from '../controllers/bookingController.js';

const router = express.Router();

// Protect every route
router.use(catchAsyncErrors(protect));

// Checkout session
router.get('/checkout-session/:tourID', catchAsyncErrors(getCheckoutSession));

// Restrict Roles for all routes in this file, after this point
router.use(restrictRolesTo('admin', 'lead-guide'));

// -------------------- Booking Routes -------------------- //
router
    .route('/')
    .get(catchAsyncErrors(getAllBooking))
    .post(catchAsyncErrors(createBooking));

router
    .route('/:id')
    .get(catchAsyncErrors(getBooking))
    .patch(catchAsyncErrors(updateBooking))
    .delete(catchAsyncErrors(deleteBooking));

export default router;
