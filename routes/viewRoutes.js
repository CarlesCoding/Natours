import express from 'express';
import {
    getOverview,
    getTour,
    getLoginForm,
    getAccountPage,
    signUpForm,
    updateUserData,
} from '../controllers/viewsController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { isLoggedIn, protect } from '../controllers/authController.js';

const router = express.Router();

// Don't need 'router.route().get()'. Because, Almost always use .get() to render the html to the page.
router.get('/', isLoggedIn, catchAsyncErrors(getOverview));
router.get('/tour/:slug', isLoggedIn, catchAsyncErrors(getTour));
router.get('/login', isLoggedIn, getLoginForm);
router.get('/signup', isLoggedIn, signUpForm);
router.get('/account', catchAsyncErrors(protect), getAccountPage);

router.patch(
    '/updateMe',
    catchAsyncErrors(protect),
    catchAsyncErrors(updateUserData)
);

export default router;
