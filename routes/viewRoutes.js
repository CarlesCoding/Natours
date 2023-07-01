import express from 'express';
import { getOverview, getTour } from '../controllers/viewsController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';

const router = express.Router();

// Don't need 'router.route().get()'. Because, Almost always use .get() to render the html to the page.

router.get('/', catchAsyncErrors(getOverview));
router.get('/tour/:slug', catchAsyncErrors(getTour));

export default router;
