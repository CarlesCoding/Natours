import express from 'express';
import { getOverview, getTour } from '../controllers/viewsController.js';

const router = express.Router();

// Don't need 'router.route().get()'. Because, Almost always use .get() to render the html to the page.

router.get('/', getOverview);
router.get('/tour', getTour);

export default router;
