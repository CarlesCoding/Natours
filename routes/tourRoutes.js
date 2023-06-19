import express from 'express';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    // checkID,
    // checkBody,
} from '../controllers/tourController.js';
import { protect, restrictRolesTo } from '../controllers/authController.js';
import reviewRouter from './reviewRoutes.js';

const router = express.Router();

// Use the reviewRouter if encounter a url that starts with "/:tourId/reviews"
// (Makes it so we only have to manage one route in one place)
// Explained better in ./reviewRoutes.js
router.use('/:tourId/reviews', reviewRouter);

// Can create a 'checkID' function to check id is valid, before hitting the route.
// router.param('id', checkID);

/* 
 We used a global error handler instead of having try/catch in every function.
 to use the error handler, just wrap the function with the  "catchAsyncErrors()" function
*/

router
    .route('/monthly-plan/:year')
    .get(
        catchAsyncErrors(protect),
        restrictRolesTo('admin', 'lead-guide', 'guide'),
        catchAsyncErrors(getMonthlyPlan)
    );
router.route('/tour-stats').get(catchAsyncErrors(getTourStats));
router.route('/top-5-cheap').get(aliasTopTours, catchAsyncErrors(getAllTours)); // use a middleware(aliasTopTours) to change the request before sending it

// TEMPLATE: router.route('/ROUTE').TYPE(catchAsyncErrors(MIDDLEWARE),  catchAsyncErrors(HANDLER));
router
    .route('/')
    .get(catchAsyncErrors(getAllTours))
    .post(
        catchAsyncErrors(protect),
        restrictRolesTo('admin', 'lead-guide'),
        catchAsyncErrors(createTour)
    );

router
    .route('/:id')
    .get(catchAsyncErrors(getTour))
    .patch(
        catchAsyncErrors(protect),
        restrictRolesTo('admin', 'lead-guide'),
        catchAsyncErrors(updateTour)
    )
    .delete(
        catchAsyncErrors(protect),
        restrictRolesTo('admin', 'lead-guide'),
        catchAsyncErrors(deleteTour)
    );

export default router;
