import express from 'express';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { protect, restrictRolesTo } from '../controllers/authController.js';
import {
    getAllReviews,
    createReview,
    deleteReview,
    updateReview,
    setTourUserIds,
    getReview,
} from '../controllers/reviewController.js';

const router = express.Router({ mergeParams: true });

/**
 * NESTED ROUTE
 * We add "router.use('/:tourId/reviews', reviewRouter);" in the ./tourRoutes.js.
 * This tells the tourRouter to use the reviewRouter if it encounters a url that starts with "/:tourId/reviews"
 *
 * mergeParams: allows (.route('/')) to inherit the params on the ".route('/:tourId/reviews')"
 * So, they can both be handled on the same route all in one place
 */

router
    .route('/')
    .get(catchAsyncErrors(getAllReviews))
    .post(
        catchAsyncErrors(protect),
        restrictRolesTo('user'),
        setTourUserIds,
        catchAsyncErrors(createReview)
    );

router
    .route('/:id')
    .get(catchAsyncErrors(getReview))
    .patch(catchAsyncErrors(updateReview))
    .delete(catchAsyncErrors(deleteReview));

export default router;
