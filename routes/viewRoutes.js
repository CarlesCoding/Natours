import express from 'express';
import {
    getOverview,
    getTour,
    getLoginForm,
    getAccountPage,
    signUpForm,
    updateUserData,
    getMyBookings,
} from '../controllers/viewsController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { isLoggedIn, protect } from '../controllers/authController.js';
import { createBookingsCheckout } from '../controllers/bookingController.js';

const router = express.Router();

// Don't need 'router.route().get()'. Because, Almost always use .get() to render the html to the page.
router.get(
    '/',
    catchAsyncErrors(createBookingsCheckout), // temp solution till website is up. (currently: UNSAFE)
    isLoggedIn,
    catchAsyncErrors(getOverview)
);
router.get('/tour/:slug', isLoggedIn, catchAsyncErrors(getTour));
router.get('/login', isLoggedIn, getLoginForm);
router.get('/signup', isLoggedIn, signUpForm);
router.get('/account', catchAsyncErrors(protect), getAccountPage);
router.get(
    '/my-bookings',
    catchAsyncErrors(protect),
    catchAsyncErrors(getMyBookings)
);

router.patch(
    '/updateMe',
    catchAsyncErrors(protect),
    catchAsyncErrors(updateUserData)
);

export default router;
