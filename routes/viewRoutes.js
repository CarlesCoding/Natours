import express from 'express';
import {
    getOverview,
    getTour,
    getLoginForm,
    getAccountPage,
    signUpForm,
} from '../controllers/viewsController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { isLoggedIn } from '../controllers/authController.js';

const router = express.Router();

router.use(isLoggedIn);

// Don't need 'router.route().get()'. Because, Almost always use .get() to render the html to the page.
router.get('/', catchAsyncErrors(getOverview));
router.get('/tour/:slug', catchAsyncErrors(getTour));
router.get('/login', getLoginForm);
router.get('/signup', signUpForm);
router.get('/account', getAccountPage);

export default router;
